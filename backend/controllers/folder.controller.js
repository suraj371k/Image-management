import Folder from "../models/folder.model.js";
import User from "../models/user.model.js";
import Image from "../models/image.model.js"; // if you use image model

//create folder
export const createFolder = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const userId = req.user;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Folder name is required" });
    }

    // Create new folder
    const folder = new Folder({
      name,
      parent: parent || null,
      user: userId,
    });

    await folder.save();

    // If parent exists, push this folder into its children
    if (parent) {
      await Folder.findByIdAndUpdate(parent, {
        $push: { children: folder._id },
      });
    }

    const populatedFolder = await Folder.findById(folder._id)
      .populate("user", "username email")
      .populate("parent", "name")
      .populate("children", "name")
      .populate("images", "name url");

    res.status(201).json({ success: true, folder: populatedFolder });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//get single folder
export const getFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id)
      .populate("user", "username email")
      .populate("parent", "name")
      .populate("children", "name")
      .populate("images", "name url");

    if (!folder) {
      return res
        .status(404)
        .json({ success: false, message: "Folder not found" });
    }

    res.status(200).json({ success: true, folder });
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get all folders of a user
export const getUserFolders = async (req, res) => {
  try {
    const userId = req.user;

    const folders = await Folder.find({ user: userId, parent: null }) // only root folders
      .populate("children", "name")
      .populate("images", "name url");

    let count = folders.length;

    res.status(200).json({ success: true, count, folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//update folder name
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const folder = await Folder.findByIdAndUpdate(
      id,
      { name, updatedAt: Date.now() },
      { new: true }
    )
      .populate("user", "username email")
      .populate("parent", "name");

    if (!folder) {
      return res
        .status(404)
        .json({ success: false, message: "Folder not found" });
    }

    res.status(200).json({ success: true, folder });
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//delete folder
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id);
    if (!folder) {
      return res
        .status(404)
        .json({ success: false, message: "Folder not found" });
    }

    // Remove this folder from its parent’s children array
    if (folder.parent) {
      await Folder.findByIdAndUpdate(folder.parent, {
        $pull: { children: folder._id },
      });
    }

    // TODO: (optional) Delete all children + images recursively if needed

    await Folder.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//get folder tree
export const getFolderTree = async (req, res) => {
  try {
    const userId = req.user;

    // Recursive function to build tree
    const buildTree = async (folderId) => {
      const folder = await Folder.findById(folderId).populate("images").lean();

      if (!folder) return null;

      const children = await Folder.find({
        parent: folder._id,
        user: userId,
      }).lean();

      const subfolders = await Promise.all(
        children.map((child) => buildTree(child._id))
      );

      return {
        ...folder,
        subfolders: subfolders.filter(Boolean), // nested structure
      };
    };

    // Get root folders
    const rootFolders = await Folder.find({
      parent: null,
      user: userId,
    }).lean();

    const tree = await Promise.all(
      rootFolders.map((folder) => buildTree(folder._id))
    );

    res.json({ success: true, tree });
  } catch (error) {
    console.error("Error building folder tree:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//get subfolder + images
export const getFolderChildren = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Check if folder exists
    const folder = await Folder.findOne({ _id: id, user: userId });
    if (!folder) {
      return res
        .status(404)
        .json({ success: false, message: "Folder not found" });
    }

    // Get subfolders
    const subfolders = await Folder.find({ parent: id, user: userId }).lean();

    // Get images
    const images = await Image.find({ folder: id, user: userId }).lean();

    res.json({
      success: true,
      folder: folder.name,
      subfolders,
      images,
    });
  } catch (error) {
    console.error("Error fetching folder children:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

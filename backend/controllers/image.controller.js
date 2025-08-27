import cloudinary from "../config/cloudinary.js";
import Folder from "../models/folder.model.js";
import fs from "fs";
import Image from "../models/image.model.js";

//upload image
export const uploadImage = async (req, res) => {
  try {
    const { folderId } = req.body;
    const userId = req.user;
 
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded" });
    }

    //check if folder exist or not
    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res
        .status(404)
        .json({ success: false, message: "Folder not found" });
    }

    //upload file to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads", //cloudinary folder name
      resource_type: "image",
    });

    // Save image info in DB
    const image = await Image.create({
      name: req.file.originalname,
      url: result.secure_url,
      folder: folderId,
      user: userId,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Delete file from local storage after upload
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (error) {
    console.log("error in upload image controller", error);
    res.status(500).json({ message: error.message });
  }
};

//get user image
export const getUserImages = async (req, res) => {
  try {
    const userId = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Find images for the user with pagination
    const images = await Image.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const totalImages = await Image.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalImages / limit);

    res.status(200).json({
      success: true,
      images,
      pagination: {
        totalImages,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.log("error in getUserImages controller", error);
    res.status(500).json({ message: error.message });
  }
};

//search image
export const searchImages = async (req, res) => {
  try {
    const userId = req.user;
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search images by name for the current user
    const images = await Image.find({
      user: userId,
      name: { $regex: searchRegex },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalImages = await Image.countDocuments({
      user: userId,
      name: { $regex: searchRegex },
    });

    const totalPages = Math.ceil(totalImages / limit);

    res.status(200).json({
      success: true,
      images,
      pagination: {
        totalImages,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.log("error in searchImages controller", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Image ID is required" });
    }

    // Find the image by ID and user
    const image = await Image.findOne({ _id: id, user: userId });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    let publicId;
    try {
      const urlParts = image.url.split("/upload/");
      if (urlParts.length === 2) {
        const afterUpload = urlParts[1];
        // Remove file extension
        publicId = afterUpload.replace(/\.[^/.]+$/, "");
      }
    } catch (e) {
      publicId = null;
    }

    // Delete from Cloudinary if publicId is available
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        // Log but don't block DB deletion
        console.log("Cloudinary deletion error:", cloudErr);
      }
    }

    // Delete from database
    await Image.deleteOne({ _id: id, user: userId });

    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.log("error in deleteImage controller", error);
    res.status(500).json({ message: error.message });
  }
};

export const downloadImage = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Image ID is required" });
    }

    // Find the image by ID and user
    const image = await Image.findOne({ _id: id, user: userId });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const https = await import('https');
    https.get(image.url, (fileRes) => {
      if (fileRes.statusCode !== 200) {
        return res.status(500).json({ message: "Failed to fetch image from storage" });
      }
      res.setHeader('Content-Type', image.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${image.name}"`);
      fileRes.pipe(res);
    }).on('error', (err) => {
      console.log("Error downloading image:", err);
      res.status(500).json({ message: "Error downloading image" });
    });

  } catch (error) {
    console.log("error in downloadImage controller", error);
    res.status(500).json({ message: error.message });
  }
};

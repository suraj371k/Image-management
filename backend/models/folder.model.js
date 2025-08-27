import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
    },

    // Parent folder for nesting (null = root)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    // Owner of the folder (user-specific access)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Subfolders inside this folder
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],

    // Images inside this folder
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
  },
  { timestamps: true }
);

// Automatically update `updatedAt`
folderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

//  When converting to JSON, include virtuals
folderSchema.set("toJSON", { virtuals: true });
folderSchema.set("toObject", { virtuals: true });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;

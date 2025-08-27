import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Image name is required"],
      trim: true,
    },

    // Path or URL of the uploaded image
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },

    // Reference to the folder containing this image
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },

    // Reference to the user who uploaded the image
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional metadata
    size: {
      type: Number, // in bytes
    },
    mimetype: {
      type: String, // e.g. image/png, image/jpeg
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
export default Image;

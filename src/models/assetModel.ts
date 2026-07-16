import mongoose, { Schema } from "mongoose";

const assetSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Wallet",
        "Documents",
        "ID Card",
        "Keys",
        "Bags",
        "Books",
        "Clothing",
        "Others",
      ],
    },

    status: {
      type: String,
      enum: ["lost", "found", "claimed"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Asset = mongoose.model("Asset", assetSchema);

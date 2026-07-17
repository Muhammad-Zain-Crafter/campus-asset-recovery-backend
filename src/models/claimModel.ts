import mongoose, { Schema } from "mongoose";

const claimSchema = new Schema(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proofDescription: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export const Claim = mongoose.model("Claim", claimSchema);
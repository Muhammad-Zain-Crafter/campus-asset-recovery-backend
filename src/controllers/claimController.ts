import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Claim } from "../models/claimModel.js";
import { Asset } from "../models/assetModel.js";
import mongoose from "mongoose";

// Student submits a claim on a "found" asset
const createClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId } = req.params;
    const { proofDescription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assetId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    if (!proofDescription) {
      return res.status(400).json({
        success: false,
        message: "Proof description is required",
      });
    }

    const asset = await Asset.findById(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    if (!asset.isApproved) {
      return res.status(400).json({
        success: false,
        message: "This asset report is not approved yet",
      });
    }

    if (asset.status !== "found") {
      return res.status(400).json({
        success: false,
        message: "Only found assets can be claimed",
      });
    }

    if (asset.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot claim an asset that you reported.",
      });
    }

    const existingClaim = await Claim.findOne({
      asset: assetId,
      claimedBy: req.user._id,
      status: "pending",
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending claim on this asset",
      });
    }

    const claim = await Claim.create({
      asset: assetId as string,
      claimedBy: req.user._id,
      proofDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully. Waiting for admin approval.",
      data: claim,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMyClaims = async (req: AuthRequest, res: Response) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate("asset")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Claims made on a specific asset
const getClaimsForAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assetId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const asset = await Asset.findById(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const isReporter = asset.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these claims",
      });
    }

    const claims = await Claim.find({ asset: assetId })
      .populate("claimedBy", "fullName studentId department")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllClaims = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await Claim.countDocuments();

    const claims = await Claim.find()
      .populate("asset")
      .populate("claimedBy", "fullName studentId department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      count: claims.length,
      currentPage: page,
      totalPages,
      totalItems,
      data: claims,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getPendingClaims = async (req: AuthRequest, res: Response) => {
  try {
    const claims = await Claim.find({ status: "pending" })
      .populate("asset")
      .populate("claimedBy", "fullName studentId department")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Admin: approve claim -> asset becomes "claimed", other pending claims on same asset auto-rejected
const approveClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Claim is already ${claim.status}`,
      });
    }

    const asset = await Asset.findById(claim.asset);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Related asset not found",
      });
    }

    claim.status = "approved";
    await claim.save();

    asset.status = "claimed";
    await asset.save();

    // auto-reject any other pending claims on this asset
    await Claim.updateMany(
      { asset: asset._id, status: "pending", _id: { $ne: claim._id } },
      {
        $set: {
          status: "rejected",
          adminNote: "Asset already claimed by another user",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Claim approved. Asset marked as claimed.",
      data: claim,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const rejectClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Claim is already ${claim.status}`,
      });
    }

    claim.status = "rejected";
    if (adminNote) claim.adminNote = adminNote;
    await claim.save();

    return res.status(200).json({
      success: true,
      message: "Claim rejected",
      data: claim,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (claim.claimedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this claim",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending claims can be cancelled",
      });
    }

    await claim.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Claim cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  createClaim,
  getMyClaims,
  getClaimsForAsset,
  getAllClaims,
  getPendingClaims,
  approveClaim,
  rejectClaim,
  deleteClaim,
};

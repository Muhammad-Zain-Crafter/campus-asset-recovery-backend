import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Request, Response } from "express";
import { Asset } from "../models/assetModel.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import mongoose from "mongoose";

interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
}

const reportAsset = async (req: MulterRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      contactNumber,
      status,
      location,
      date,
    } = req.body;
    if (
      !title ||
      !description ||
      !category ||
      !contactNumber ||
      !status ||
      !location ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    let image = {
      url: "",
      publicId: "",
    };
    if (req.file?.path) {
      const uploadImage = await uploadOnCloudinary(
        req.file.path,
        "student-management/assets",
      );
      if (uploadImage) {
        image = {
          url: uploadImage.secure_url,
          publicId: uploadImage.public_id,
        };
      }
    }
    const asset = await Asset.create({
      title,
      description,
      category,
      contactNumber,
      status,
      location,
      date,
      image,
      reportedBy: req.user._id,
    });
    return res.status(201).json({
      success: true,
      message: "Asset reported successfully",
      data: asset,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllAssets = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search?.toString().trim();

    const filter: any = {
      isApproved: true,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const totalItems = await Asset.countDocuments(filter);

    const assets = await Asset.find(filter)
      .populate("reportedBy", "fullName studentId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      count: assets.length,
      currentPage: page,
      totalPages,
      totalItems,
      data: assets,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAssetById = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id).populate(
      "reportedBy",
      "fullName studentId",
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMyAssets = async (req: AuthRequest, res: Response) => {
  try {
    const assets = await Asset.find({
      reportedBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateAsset = async (req: MulterRequest, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    if (asset.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const {
      title,
      description,
      category,
      status,
      location,
      date,
      contactNumber,
    } = req.body;

    if (title) asset.title = title;
    if (description) asset.description = description;
    if (category) asset.category = category;
    if (status) asset.status = status;
    if (location) asset.location = location;
    if (date) asset.date = date;
    if (contactNumber) asset.contactNumber = contactNumber;

    if (req.file?.path) {
      if (asset.image?.publicId) {
        await deleteFromCloudinary(asset.image.publicId);
      }

      const uploadedImage = await uploadOnCloudinary(
        req.file.path,
        "student-management/assets",
      );

      if (uploadedImage) {
        asset.image = {
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
        };
      }
    }
    await asset.save();
    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: asset,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    if (asset.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    if (asset.image?.publicId) {
      await deleteFromCloudinary(asset.image.publicId);
    }

    await asset.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const approveAsset = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.json({
        success: false,
        message: "Asset not found",
      });
    }
    if (asset.isApproved === true) {
      return res.json({
        message: "asset already approved",
      });
    }
    asset.isApproved = true;
    await asset.save();
    return res.status(200).json({
      success: true,
      message: "Asset approved successfully",
      data: asset,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getPendingAssets = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search?.toString().trim();

    const filter: any = {
      isApproved: false,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const totalItems = await Asset.countDocuments(filter);

    const assets = await Asset.find(filter)
      .populate("reportedBy", "fullName studentId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    if (assets.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending assets found",
        count: 0,
        currentPage: page,
        totalPages,
        totalItems,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: assets.length,
      currentPage: page,
      totalPages,
      totalItems,
      data: assets,
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
  reportAsset,
  getAllAssets,
  getAssetById,
  getMyAssets,
  updateAsset,
  deleteAsset,
  approveAsset,
  getPendingAssets,
};

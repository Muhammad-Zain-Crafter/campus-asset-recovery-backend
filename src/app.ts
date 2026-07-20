import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.send("Campus Asset Recovery API Running...");
});

import userRouter from "./routes/userRoute.js"
import assetRouter from "./routes/assetRoute.js"
import claimRouter from "./routes/claimRoute.js";

app.use("/api/v1/campusAssetRecovery/users/", userRouter)
app.use("/api/v1/campusAssetRecovery/assets/", assetRouter)
app.use("/api/v1/campusAssetRecovery/claims/", claimRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Max allowed is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err.message?.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// test route
app.get('/', (req, res) => {
    res.send('Welcome to the Campus Asset Recovery API');
})

export default app;
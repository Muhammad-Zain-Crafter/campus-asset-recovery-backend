import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

app.use("/api/v1/campusAssetRecovery/users/", userRouter)
app.use("/api/v1/campusAssetRecovery/assets/", assetRouter)



export default app;
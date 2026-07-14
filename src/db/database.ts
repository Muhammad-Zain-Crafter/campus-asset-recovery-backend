import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB Connected: ${connection.connection.host}`);

    } catch (error:any) {
        console.log("Database Connection Error");
        console.log(error.message);
        process.exit(1);
    }
};

export default connectDB;
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});



app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Trellis API running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
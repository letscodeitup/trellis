import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import orgRoutes from "./routes/orgs.js";
import boardRoutes from "./routes/boards.js";
import cardRoutes from "./routes/cards.js";
import { createServer } from "http";
import { initSocket } from "./socket/index.js";




dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/cards", cardRoutes);

app.get("/", (req, res) => res.send("Trellis API running..."));

const server = createServer(app);
initSocket(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import Express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRouter } from "./src/user/user.controller";
import { barberRouter } from "./src/barber/barber.controller";
import { specialtyRouter } from "./src/specialty/specialty.controller";
import { appointmentRouter } from "./src/appointment/appointment.controller";
import { authRouter } from "./src/auth/auth.controller";
import { authMiddleware } from "./src/middleware/authMiddleware";

const PORT = Number(process.env.PORT) || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = Express();

// Security middleware
const corsOptions = {
  origin: "http://192.168.15.7:3000", //FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours,
  exposedHeaders: ["Set-Cookie"],
};

console.log("Accepting requests from: " + FRONTEND_URL);
app.use((res, req, next) => {
  console.log("received a call");
  next();
});
// Middleware
app.use(cors(corsOptions));
app.use(Express.json({ limit: "10kb" })); // Limit payload size
app.use(cookieParser());

// Public Routes (no authentication required)
app.use("/api/auth", authRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Protected Routes (require authentication)
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/barbers", authMiddleware, barberRouter);
app.use("/api/specialties", authMiddleware, specialtyRouter);
app.use("/api/appointments", authMiddleware, appointmentRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running");
});

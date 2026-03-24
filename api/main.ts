import Express from "express";
import { userRouter } from "./src/user/user.controller";
import { barberRouter } from "./src/barber/barber.controller";
import { specialtyRouter } from "./src/specialty/specialty.controller";
import { appointmentRouter } from "./src/appointment/appointment.controller";
import { authRouter } from "./src/auth/auth.controller";
import { authMiddleware } from "./src/middleware/authMiddleware";

const PORT = process.env.PORT || 3000;

const app = Express();

// Middleware
app.use(Express.json());

// Public Routes (no authentication required)
app.use("/api/auth", authRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Protected Routes (require authentication)
app.use(authMiddleware);
app.use("/api/users", userRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/specialties", specialtyRouter);
app.use("/api/appointments", appointmentRouter);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

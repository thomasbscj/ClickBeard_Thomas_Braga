import Express from "express";
import { userRouter } from "./src/user/use.controller";
import { barberRouter } from "./src/barber/barber.controller";
import { specialtyRouter } from "./src/specialty/specialty.controller";
import { appointmentRouter } from "./src/appointment/appointment.controller";

const PORT = process.env.PORT || 3000;

const app = Express();

// Middleware
app.use(Express.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/specialties", specialtyRouter);
app.use("/api/appointments", appointmentRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

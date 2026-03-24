"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const use_controller_1 = require("./src/user/use.controller");
const barber_controller_1 = require("./src/barber/barber.controller");
const specialty_controller_1 = require("./src/specialty/specialty.controller");
const appointment_controller_1 = require("./src/appointment/appointment.controller");
const auth_controller_1 = require("./src/auth/auth.controller");
const authMiddleware_1 = require("./src/middleware/authMiddleware");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Public Routes (no authentication required)
app.use("/api/auth", auth_controller_1.authRouter);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});
// Protected Routes (require authentication)
app.use(authMiddleware_1.authMiddleware);
app.use("/api/users", use_controller_1.userRouter);
app.use("/api/barbers", barber_controller_1.barberRouter);
app.use("/api/specialties", specialty_controller_1.specialtyRouter);
app.use("/api/appointments", appointment_controller_1.appointmentRouter);
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
//# sourceMappingURL=main.js.map
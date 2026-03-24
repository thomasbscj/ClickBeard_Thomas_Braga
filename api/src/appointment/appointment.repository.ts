import { Appointment } from "./appointment.model";
import { db } from "../repository/repository";

export interface IAppointmentRepository {
  createAppointment(appointment: Appointment): Promise<Appointment>;
  getAppointmentById(id: number): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  updateAppointment(appointment: Appointment): Promise<Appointment>;
  deleteAppointmentById(id: number): Promise<any>;
}

class AppointmentRepository implements IAppointmentRepository {
  constructor() {}

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    return db.appointment.create({
      data: {
        userId: appointment.userId,
        barberId: appointment.barberId,
        datetime: appointment.datetime,
      },
    });
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    const appointment = await db.appointment.findFirst({
      where: {
        id: id,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return {
      id: appointment.id,
      userId: appointment.userId,
      barberId: appointment.barberId,
      datetime: appointment.datetime,
    };
  }

  async getAllAppointments(): Promise<Appointment[]> {
    const appointments = await db.appointment.findMany();

    return appointments.map((appointment) => ({
      id: appointment.id,
      userId: appointment.userId,
      barberId: appointment.barberId,
      datetime: appointment.datetime,
    }));
  }

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    const updatedAppointment = await db.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        userId: appointment.userId,
        barberId: appointment.barberId,
        datetime: appointment.datetime,
      },
    });

    return {
      id: updatedAppointment.id,
      userId: updatedAppointment.userId,
      barberId: updatedAppointment.barberId,
      datetime: updatedAppointment.datetime,
    };
  }

  async deleteAppointmentById(id: number): Promise<any> {
    return db.appointment.delete({
      where: {
        id: id,
      },
    });
  }
}

export const appointmentRepository = new AppointmentRepository();

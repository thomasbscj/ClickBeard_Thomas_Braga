import { Appointment } from "./appointment.model";
import { db } from "../repository/repository";
import { PaginationParams, PaginatedResponse } from "../types/types";

export interface IAppointmentRepository {
  createAppointment(appointment: Appointment): Promise<Appointment>;
  getAppointmentById(id: number): Promise<Appointment>;
  getAllAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>>;
  getAppointmentsByUserId(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>>;
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
        active: true,
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
      active: appointment.active,
    };
  }

  async getAllAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const limit = pagination?.limit || 100;
    const offset = pagination?.offset || 0;

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where: {
          active: true,
        },
        skip: offset,
        take: limit,
        orderBy: {
          datetime: "desc",
        },
      }),
      db.appointment.count(),
    ]);

    return {
      data: appointments.map((appointment) => ({
        id: appointment.id,
        userId: appointment.userId,
        barberId: appointment.barberId,
        datetime: appointment.datetime,
        active: appointment.active,
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  async getAppointmentsByUserId(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where: {
          userId: userId,
          active: true
        },
        skip: offset,
        take: limit,
      }),
      db.appointment.count({
        where: {
          userId: userId,
          active: true
        },
      }),
    ]);

    return {
      data: appointments.map((appointment) => ({
        id: appointment.id,
        userId: appointment.userId,
        barberId: appointment.barberId,
        datetime: appointment.datetime,
        active: appointment.active,
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    };
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
        active: appointment.active,
      },
    });

    return {
      id: updatedAppointment.id,
      userId: updatedAppointment.userId,
      barberId: updatedAppointment.barberId,
      datetime: updatedAppointment.datetime,
      active: updatedAppointment.active,
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

import { Appointment } from "./appointment.model";
import { appointmentRepository } from "./appointment.repository";
import type { IAppointmentRepository } from "./appointment.repository";
import { PaginationParams, PaginatedResponse } from "../types/types";

interface IAppointmentService {
  createAppointment(appointment: Appointment): Promise<Appointment>;
  getAppointmentById(id: number): Promise<Appointment>;
  getAllAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>>;
  getAppointmentsByUserId(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>>;
  getPastAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>>;
  getUpcomingAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>>;
  updateAppointment(appointment: Appointment): Promise<Appointment>;
  deleteAppointmentById(id: number): Promise<void>;
  cancelAppointment(
    appointmentId: number,
    userId: number,
  ): Promise<Appointment>;
}

export class AppointmentService implements IAppointmentService {
  private readonly OPENING_HOUR = 11;
  private readonly CLOSING_HOUR = 21;
  private readonly APPOINTMENT_DURATION = 30;
  private readonly CANCELLATION_NOTICE_HOURS = 2;

  constructor(
    private appointmentRepository: IAppointmentRepository,
    private getCurrentDate: () => Date = () => new Date(),
  ) {}

  private roundToNearestHalfHour(datetime: Date): Date {
    const minutes = datetime.getMinutes();
    const rounded = new Date(datetime);

    if (minutes <= 15) {
      rounded.setMinutes(0, 0, 0);
    } else if (minutes <= 45) {
      rounded.setMinutes(30, 0, 0);
    } else {
      // minutes > 45, round to next hour
      rounded.setHours(rounded.getHours() + 1);
      rounded.setMinutes(0, 0, 0);
    }

    return rounded;
  }

  private isWithinBusinessHours(datetime: Date): boolean {
    // Business hours in São Paulo (UTC-3): 8:00-17:30
    // Converted to UTC: 11:00-20:30
    const hour = datetime.getUTCHours();
    const minutes = datetime.getUTCMinutes();
    console.log(hour, minutes)
    // Allow 11:00-20:29 UTC (8:00-17:29 UTC-3)
    const isAtOrAfter11 = hour >= 11;
    const isBeforeOrAt20_30 = hour < 20 || (hour === 20 && minutes <= 30);

    return isAtOrAfter11 && isBeforeOrAt20_30;
  }

  private async isBarberAvailable(
    barberId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    const conflictingAppointments = allAppointments.data.filter(
      (apt) =>
        apt.barberId === barberId &&
        new Date(apt.datetime).getTime() < endTime.getTime() &&
        new Date(apt.datetime).getTime() + this.APPOINTMENT_DURATION * 60000 >
          startTime.getTime(),
    );

    return conflictingAppointments.length === 0;
  }

  private async validateAppointmentDateTime(
    appointmentDateTime: Date,
    barberId: number,
    excludeAppointmentId?: number,
  ): Promise<void> {
    if (!this.isWithinBusinessHours(appointmentDateTime)) {
      throw new Error(
        `Appointments must be scheduled between 8:00 and 17:30 (São Paulo time)`,
      );
    }
    const endTime = new Date(
      appointmentDateTime.getTime() + this.APPOINTMENT_DURATION * 60000,
    );
    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    const conflictingAppointments = allAppointments.data.filter(
      (apt) =>
        (!excludeAppointmentId || apt.id !== excludeAppointmentId) &&
        apt.barberId === barberId &&
        new Date(apt.datetime).getTime() < endTime.getTime() &&
        new Date(apt.datetime).getTime() + this.APPOINTMENT_DURATION * 60000 >
          appointmentDateTime.getTime(),
    );

    if (conflictingAppointments.length > 0) {
      throw new Error(
        "Barber is not available at this time. Please choose another time.",
      );
    }
  }

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    let appointmentDateTime = new Date(appointment.datetime);
    appointmentDateTime = this.roundToNearestHalfHour(appointmentDateTime);
    await this.validateAppointmentDateTime(
      appointmentDateTime,
      appointment.barberId,
    );

    const roundedAppointment = {
      ...appointment,
      datetime: appointmentDateTime,
    };

    return this.appointmentRepository.createAppointment(roundedAppointment);
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    return this.appointmentRepository.getAppointmentById(id);
  }

  async getAllAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    return this.appointmentRepository.getAllAppointments(pagination);
  }

  async getAppointmentsByUserId(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    return this.appointmentRepository.getAppointmentsByUserId(
      userId,
      pagination,
    );
  }

  async getPastAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const now = this.getCurrentDate();
    // Get today at 00:00:00
    const todayAtMidnight = new Date(now);
    todayAtMidnight.setHours(0, 0, 0, 0);

    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    const pastAppointments = allAppointments.data.filter(
      (apt) => new Date(apt.datetime).getTime() < todayAtMidnight.getTime(),
    );

    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    return {
      data: pastAppointments.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: pastAppointments.length,
      },
    };
  }

  async getUpcomingAppointments(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const now = this.getCurrentDate();
    // Get today at 00:00:00
    const todayAtMidnight = new Date(now);
    todayAtMidnight.setHours(0, 0, 0, 0);

    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    const upcomingAppointments = allAppointments.data.filter(
      (apt) => new Date(apt.datetime).getTime() >= todayAtMidnight.getTime(),
    );

    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    return {
      data: upcomingAppointments.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: upcomingAppointments.length,
      },
    };
  }

  async getAllAppointmentsSorted(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    // Sort by datetime in descending order (newest first)
    const sortedAppointments = [...allAppointments.data].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );

    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    return {
      data: sortedAppointments.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: sortedAppointments.length,
      },
    };
  }

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    let appointmentDateTime = new Date(appointment.datetime);

    appointmentDateTime = this.roundToNearestHalfHour(appointmentDateTime);
    await this.validateAppointmentDateTime(
      appointmentDateTime,
      appointment.barberId,
      appointment.id,
    );

    const roundedAppointment = {
      ...appointment,
      datetime: appointmentDateTime,
    };

    return this.appointmentRepository.updateAppointment(roundedAppointment);
  }

  async deleteAppointmentById(id: number): Promise<void> {
    return this.appointmentRepository.deleteAppointmentById(id);
  }

  async cancelAppointment(
    appointmentId: number,
    userId: number,
  ): Promise<Appointment> {
    const appointment =
      await this.appointmentRepository.getAppointmentById(appointmentId);

    if (appointment.userId !== userId) {
      throw new Error("You can only cancel your own appointments");
    }

    const now = this.getCurrentDate();
    const appointmentTime = appointment.datetime;
    const hoursUntilAppointment =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    console.log(hoursUntilAppointment);

    if (hoursUntilAppointment < this.CANCELLATION_NOTICE_HOURS) {
      throw new Error(
        `Appointments must be cancelled at least ${this.CANCELLATION_NOTICE_HOURS} hours in advance`,
      );
    }

    return this.appointmentRepository.updateAppointment({
      ...appointment,
      active: false,
    });
  }
}

export const appointmentService = new AppointmentService(appointmentRepository);

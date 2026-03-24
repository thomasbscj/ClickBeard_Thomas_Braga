import { Appointment } from "./appointment.model";
import { appointmentRepository } from "./appointment.repository";
import type { IAppointmentRepository } from "./appointment.repository";

interface IAppointmentService {
  createAppointment(appointment: Appointment): Promise<Appointment>;
  getAppointmentById(id: number): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  updateAppointment(appointment: Appointment): Promise<Appointment>;
  deleteAppointmentById(id: number): Promise<void>;
  cancelAppointment(
    appointmentId: number,
    userId: number,
  ): Promise<Appointment>;
}

class AppointmentService implements IAppointmentService {
  private readonly OPENING_HOUR = 8;
  private readonly CLOSING_HOUR = 18;
  private readonly APPOINTMENT_DURATION = 30;
  private readonly CANCELLATION_NOTICE_HOURS = 2;

  constructor(private appointmentRepository: IAppointmentRepository) {}

  private roundToNearestHalfHour(datetime: Date): Date {
    const minutes = datetime.getMinutes();
    const rounded = new Date(datetime);
    if (minutes < 30) {
      rounded.setMinutes(0, 0, 0);
    } else {
      rounded.setMinutes(30, 0, 0);
    }

    return rounded;
  }

  private isWithinBusinessHours(datetime: Date): boolean {
    const hour = datetime.getHours();
    return hour >= this.OPENING_HOUR && hour < this.CLOSING_HOUR;
  }

  private async isBarberAvailable(
    barberId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    const conflictingAppointments = allAppointments.filter(
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
        `Appointments must be scheduled between ${this.OPENING_HOUR}:00 and ${this.CLOSING_HOUR}:00`,
      );
    }
    const endTime = new Date(
      appointmentDateTime.getTime() + this.APPOINTMENT_DURATION * 60000,
    );
    const allAppointments =
      await this.appointmentRepository.getAllAppointments();

    const conflictingAppointments = allAppointments.filter(
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

  async getAllAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.getAllAppointments();
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return this.appointmentRepository.getAppointmentsByUserId(userId);
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

    const now = new Date();
    const appointmentTime = new Date(appointment.datetime);
    const hoursUntilAppointment =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

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

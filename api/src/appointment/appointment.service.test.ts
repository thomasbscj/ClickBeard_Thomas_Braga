import { describe, it, expect, beforeEach } from "vitest";
import { Appointment } from "./appointment.model";
import type { IAppointmentRepository } from "./appointment.repository";
import { AppointmentService } from "./appointment.service";
import type { PaginationParams, PaginatedResponse } from "../types/types";

// Mock hardcoded do repositório de Appointment
const mockAppointmentRepository: IAppointmentRepository = {
  createAppointment: async (appointment: Appointment): Promise<Appointment> => {
    return {
      id: 1,
      userId: appointment.userId,
      barberId: appointment.barberId,
      datetime: appointment.datetime,
      active: appointment.active !== false ? true : appointment.active,
    };
  },

  getAppointmentById: async (id: number): Promise<Appointment> => {
    if (id === 1) {
      return {
        id: 1,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T14:00:00"),
        active: true,
      };
    }
    if (id === 4) {
      // Appointment in 1 hour from mock current time (2026-03-24T12:00:00)
      // So it's less than 2 hours, should fail cancellation
      return {
        id: 4,
        userId: 3,
        barberId: 1,
        datetime: new Date("2026-03-24T13:00:00"),
        active: true,
      };
    }
    if (id === 5) {
      // Future appointment for cancelAppointment tests (plenty of time)
      return {
        id: 5,
        userId: 1,
        barberId: 2,
        datetime: new Date("2026-04-01T15:00:00"),
        active: true,
      };
    }
    throw new Error("Appointment not found");
  },

  getAllAppointments: async (
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> => {
    const allData = [
      {
        id: 1,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T14:00:00"),
        active: true,
      },
      {
        id: 2,
        userId: 2,
        barberId: 1,
        datetime: new Date("2026-03-25T14:30:00"),
        active: true,
      },
      {
        id: 3,
        userId: 1,
        barberId: 2,
        datetime: new Date("2026-03-25T15:00:00"),
        active: true,
      },
      {
        id: 4,
        userId: 3,
        barberId: 1,
        datetime: new Date("2026-03-24T13:00:00"),
        active: false,
      },
    ];

    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    return {
      data: allData.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: allData.length,
      },
    };
  },

  getAppointmentsByUserId: async (
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> => {
    const allData = [
      {
        id: 1,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T14:00:00"),
        active: true,
      },
      {
        id: 2,
        userId: 2,
        barberId: 1,
        datetime: new Date("2026-03-25T14:30:00"),
        active: true,
      },
      {
        id: 3,
        userId: 1,
        barberId: 2,
        datetime: new Date("2026-03-25T15:00:00"),
        active: true,
      },
      {
        id: 4,
        userId: 3,
        barberId: 1,
        datetime: new Date("2026-03-24T13:00:00"),
        active: false,
      },
    ];

    const filtered = allData.filter((apt) => apt.userId === userId);
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    return {
      data: filtered.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: filtered.length,
      },
    };
  },

  updateAppointment: async (appointment: Appointment): Promise<Appointment> => {
    return {
      id: appointment.id,
      userId: appointment.userId,
      barberId: appointment.barberId,
      datetime: appointment.datetime,
      active: appointment.active,
    };
  },

  deleteAppointmentById: async (id: number): Promise<void> => {
    if (id < 1) {
      throw new Error("Invalid appointment ID");
    }
    return;
  },
};

describe("AppointmentService", () => {
  let appointmentService: AppointmentService;

  beforeEach(() => {
    // Mock getCurrentDate to return a fixed date: 2026-03-24T12:00:00
    const mockGetCurrentDate = () => new Date("2026-03-24T12:00:00");
    appointmentService = new AppointmentService(
      mockAppointmentRepository,
      mockGetCurrentDate,
    );
  });

  describe("createAppointment", () => {
    it("should create a new appointment successfully", async () => {
      const appointmentInput: Appointment = {
        id: 5,
        userId: 2,
        barberId: 2,
        datetime: new Date("2026-03-27T14:00:00"),
        active: true,
      };

      const result =
        await appointmentService.createAppointment(appointmentInput);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.userId).toBe(2);
      expect(result.barberId).toBe(2);
      expect(result.active).toBe(true);
    });

    it("should round datetime to nearest half hour", async () => {
      const appointmentInput: Appointment = {
        id: 0,
        userId: 2,
        barberId: 2,
        datetime: new Date("2026-03-25T14:15:00"),
        active: true,
      };

      const result =
        await appointmentService.createAppointment(appointmentInput);

      expect(result).toBeDefined();
      expect(result.datetime.getMinutes()).toBe(0);
    });

    it("should round to 30 minutes when between 16-45", async () => {
      const appointmentInput: Appointment = {
        id: 0,
        userId: 2,
        barberId: 2,
        datetime: new Date("2026-03-25T14:20:00"),
        active: true,
      };

      const result =
        await appointmentService.createAppointment(appointmentInput);

      expect(result).toBeDefined();
      expect(result.datetime.getMinutes()).toBe(30);
    });

    it("should round to next hour when minutes > 45", async () => {
      const appointmentInput: Appointment = {
        id: 0,
        userId: 2,
        barberId: 3,
        datetime: new Date("2026-03-25T14:50:00"),
        active: true,
      };

      const result =
        await appointmentService.createAppointment(appointmentInput);

      expect(result).toBeDefined();
      expect(result.datetime.getMinutes()).toBe(0);
      expect(result.datetime.getHours()).toBe(15);
    });

    it("should validate business hours (11:00-21:00)", async () => {
      const appointmentInput: Appointment = {
        id: 0,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T21:00:00Z"),
        active: true,
      };

      await expect(
        appointmentService.createAppointment(appointmentInput),
      ).rejects.toThrow(
        "Appointments must be scheduled between 11:00 and 21:00",
      );
    });

    it("should prevent early morning appointments", async () => {
      const appointmentInput: Appointment = {
        id: 0,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T10:00:00Z"),
        active: true,
      };

      await expect(
        appointmentService.createAppointment(appointmentInput),
      ).rejects.toThrow(
        "Appointments must be scheduled between 11:00 and 21:00",
      );
    });

    it("should validate barber availability", async () => {
      const appointmentInput: Appointment = {
        id: 0,
        userId: 3,
        barberId: 1,
        datetime: new Date("2026-03-25T14:00:00"),
        active: true,
      };

      await expect(
        appointmentService.createAppointment(appointmentInput),
      ).rejects.toThrow(
        "Barber is not available at this time. Please choose another time.",
      );
    });
  });

  describe("getAppointmentById", () => {
    it("should return an appointment by id", async () => {
      const result = await appointmentService.getAppointmentById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.barberId).toBe(1);
    });

    it("should throw error when appointment not found", async () => {
      await expect(appointmentService.getAppointmentById(999)).rejects.toThrow(
        "Appointment not found",
      );
    });

    it("should return correct appointment details", async () => {
      const result = await appointmentService.getAppointmentById(1);

      expect(result.active).toBe(true);
      expect(result.barberId).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.datetime).toEqual(new Date("2026-03-25T14:00:00"));
    });
  });

  describe("getAllAppointments", () => {
    it("should return all appointments", async () => {
      const result = await appointmentService.getAllAppointments();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.data.length).toBe(4);
      expect(result.pagination.total).toBe(4);
    });

    it("should return appointments with correct data", async () => {
      const result = await appointmentService.getAllAppointments();

      expect(result.data[0]!.userId).toBe(1);
      expect(result.data[1]!.userId).toBe(2);
      expect(result.data[2]!.userId).toBe(1);
      expect(result.data[3]!.userId).toBe(3);
    });

    it("should return appointments with all required fields", async () => {
      const result = await appointmentService.getAllAppointments();

      result.data.forEach((apt) => {
        expect(apt.id).toBeDefined();
        expect(apt.userId).toBeDefined();
        expect(apt.barberId).toBeDefined();
        expect(apt.datetime).toBeDefined();
        expect(apt.active).toBeDefined();
      });
    });
  });

  describe("getAppointmentsByUserId", () => {
    it("should return appointments for a specific user", async () => {
      const result = await appointmentService.getAppointmentsByUserId(1);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.data.length).toBe(2);
      expect(result.data.every((apt) => apt.userId === 1)).toBe(true);
    });

    it("should return empty array for user with no appointments", async () => {
      const result = await appointmentService.getAppointmentsByUserId(999);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(0);
    });

    it("should return correct user appointments", async () => {
      const result = await appointmentService.getAppointmentsByUserId(3);

      expect(result.data.length).toBe(1);
      expect(result.data[0]!.userId).toBe(3);
      expect(result.data[0]!.id).toBe(4);
    });
  });

  describe("updateAppointment", () => {
    it("should update an appointment successfully", async () => {
      const updatedAppointment: Appointment = {
        id: 1,
        userId: 1,
        barberId: 2,
        datetime: new Date("2026-03-25T15:30:00"),
        active: true,
      };

      const result =
        await appointmentService.updateAppointment(updatedAppointment);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.barberId).toBe(2);
    });

    it("should validate business hours on update", async () => {
      const updatedAppointment: Appointment = {
        id: 1,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T21:00:00Z"),
        active: true,
      };

      await expect(
        appointmentService.updateAppointment(updatedAppointment),
      ).rejects.toThrow(
        "Appointments must be scheduled between 11:00 and 21:00",
      );
    });

    it("should preserve appointment active status", async () => {
      const updatedAppointment: Appointment = {
        id: 1,
        userId: 1,
        barberId: 1,
        datetime: new Date("2026-03-25T16:00:00"),
        active: false,
      };

      const result =
        await appointmentService.updateAppointment(updatedAppointment);

      expect(result.active).toBe(false);
    });
  });

  describe("getPastAppointments", () => {
    it("should return only past appointments (before today at 00:00:00)", async () => {
      // Current mocked time: 2026-03-24T12:00:00
      // Today at midnight: 2026-03-24T00:00:00
      // All test appointments are on or after 2026-03-24, so no past appointments
      const result = await appointmentService.getPastAppointments();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.data.length).toBe(0);
    });

    it("should include pagination information", async () => {
      const result = await appointmentService.getPastAppointments({
        limit: 5,
        offset: 0,
      });

      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getUpcomingAppointments", () => {
    it("should return only upcoming appointments (from today at 00:00:00 onwards)", async () => {
      // Current mocked time: 2026-03-24T12:00:00
      // Today at midnight: 2026-03-24T00:00:00
      // Appointments 1, 2, 3, 4 are all on or after 2026-03-24T00:00:00
      const result = await appointmentService.getUpcomingAppointments();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.data.length).toBe(4);
    });

    it("should include all required fields in upcoming appointments", async () => {
      const result = await appointmentService.getUpcomingAppointments();

      result.data.forEach((apt) => {
        expect(apt.id).toBeDefined();
        expect(apt.userId).toBeDefined();
        expect(apt.barberId).toBeDefined();
        expect(apt.datetime).toBeDefined();
        expect(apt.active).toBeDefined();
      });
    });

    it("should include pagination information", async () => {
      const result = await appointmentService.getUpcomingAppointments({
        limit: 2,
        offset: 0,
      });

      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.total).toBe(4);
      expect(result.data.length).toBe(2);
    });

    it("should respect pagination offset", async () => {
      const resultPage1 = await appointmentService.getUpcomingAppointments({
        limit: 2,
        offset: 0,
      });
      const resultPage2 = await appointmentService.getUpcomingAppointments({
        limit: 2,
        offset: 2,
      });

      expect(resultPage1.data[0]!.id).not.toBe(resultPage2.data[0]!.id);
      expect(resultPage2.data.length).toBe(2);
    });
  });

  describe("deleteAppointmentById", () => {
    it("should delete an appointment successfully", async () => {
      await expect(
        appointmentService.deleteAppointmentById(1),
      ).resolves.not.toThrow();
    });

    it("should return void on successful deletion", async () => {
      const result = await appointmentService.deleteAppointmentById(2);

      expect(result).toBeUndefined();
    });

    it("should throw error for invalid appointment ID", async () => {
      await expect(
        appointmentService.deleteAppointmentById(-1),
      ).rejects.toThrow("Invalid appointment ID");
    });

    it("should throw error for zero ID", async () => {
      await expect(appointmentService.deleteAppointmentById(0)).rejects.toThrow(
        "Invalid appointment ID",
      );
    });
  });

  describe("cancelAppointment", () => {
    it("should cancel appointment with sufficient notice", async () => {
      // Appointment 5 is 2026-04-01, plenty of time to cancel from 2026-03-24
      const result = await appointmentService.cancelAppointment(5, 1);

      expect(result).toBeDefined();
      expect(result.active).toBe(false);
    });

    it("should throw error if user tries to cancel another user's appointment", async () => {
      await expect(
        appointmentService.cancelAppointment(5, 999),
      ).rejects.toThrow("You can only cancel your own appointments");
    });

    it("should require at least 2 hours notice", async () => {
      // Current mocked time: 2026-03-24T12:00:00
      // Appointment 4 is 2026-03-24T13:00:00 (only 1 hour away)
      // So it should throw an error because it doesn't have 2+ hours notice
      await expect(appointmentService.cancelAppointment(4, 3)).rejects.toThrow(
        "Appointments must be cancelled at least 2 hours in advance",
      );
    });
  });
});

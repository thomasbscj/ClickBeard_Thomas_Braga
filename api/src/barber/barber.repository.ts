import { Barber, BarberCreateInput } from "./barber.model";
import { db } from "../repository/repository";
import { PaginationParams, PaginatedResponse } from "../types/types";

export interface IBarberRepository {
  createBarber(barber: BarberCreateInput): Promise<Barber>;
  getBarberById(id: number): Promise<Barber>;
  getAllBarbers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Barber>>;
  updateBarber(barber: Barber): Promise<Barber>;
  deleteBarberById(id: number): Promise<any>;
}

class BarberRepository implements IBarberRepository {
  constructor() {}

  async createBarber(barber: BarberCreateInput): Promise<Barber> {
    const createdBarber = await (db.barber.create as any)({
      data: {
        name: barber.name,
        bornAt: barber.bornAt,
        hiredAt: barber.hiredAt,
        specialties: {
          create: barber.specialties.map((specialtyName) => ({
            specialty: {
              connect: {
                name: specialtyName,
              },
            },
          })),
        },
      },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        appointments: {
          where: {
            active: true,
          },
        },
      },
    });

    const APPOINTMENT_DURATION = 30;
    const busyTimes = createdBarber.appointments.map((apt: any) => ({
      start: new Date(apt.datetime),
      end: new Date(apt.datetime.getTime() + APPOINTMENT_DURATION * 60000),
    }));

    return {
      id: createdBarber.id,
      name: createdBarber.name,
      specialties: createdBarber.specialties.map(
        (bs: any) => bs.specialty.name,
      ),
      bornAt: createdBarber.bornAt,
      hiredAt: createdBarber.hiredAt,
      busyTimes,
    };
  }

  async getBarberById(id: number): Promise<Barber> {
    const barber = await (db.barber.findFirst as any)({
      where: {
        id: id,
      },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        appointments: {
          where: {
            active: true,
          },
        },
      },
    });

    if (!barber) {
      throw new Error("Barber not found");
    }

    const APPOINTMENT_DURATION = 30; 
    const busyTimes = barber.appointments.map((apt: any) => ({
      start: new Date(apt.datetime),
      end: new Date(apt.datetime.getTime() + APPOINTMENT_DURATION * 60000),
    }));

    return {
      id: barber.id,
      name: barber.name,
      specialties: barber.specialties.map((bs: any) => bs.specialty.name),
      bornAt: barber.bornAt,
      hiredAt: barber.hiredAt,
      busyTimes,
    };
  }

  async getAllBarbers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Barber>> {
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    const [barbers, total] = await Promise.all([
      (db.barber.findMany as any)({
        skip: offset,
        take: limit,
        include: {
          specialties: {
            include: {
              specialty: true,
            },
          },
          appointments: {
            where: {
              active: true,
            },
          },
        },
      }),
      db.barber.count(),
    ]);

    const APPOINTMENT_DURATION = 30; 
    return {
      data: barbers.map((barber: any) => ({
        id: barber.id,
        name: barber.name,
        specialties: barber.specialties.map((bs: any) => bs.specialty.name),
        bornAt: barber.bornAt,
        hiredAt: barber.hiredAt,
        busyTimes: barber.appointments.map((apt: any) => ({
          start: new Date(apt.datetime),
          end: new Date(apt.datetime.getTime() + APPOINTMENT_DURATION * 60000),
        })),
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  async updateBarber(barber: Barber): Promise<Barber> {
    const dbAny = db as any;
    await dbAny.barberSpecialty.deleteMany({
      where: {
        barberId: barber.id,
      },
    });

    const updatedBarber = await (db.barber.update as any)({
      where: {
        id: barber.id,
      },
      data: {
        name: barber.name,
        bornAt: barber.bornAt,
        hiredAt: barber.hiredAt,
        specialties: {
          create: barber.specialties.map((specialtyName) => ({
            specialty: {
              connect: {
                name: specialtyName,
              },
            },
          })),
        },
      },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        appointments: {
          where: {
            active: true,
          },
        },
      },
    });

    const APPOINTMENT_DURATION = 30; 
    const busyTimes = updatedBarber.appointments.map((apt: any) => ({
      start: new Date(apt.datetime),
      end: new Date(apt.datetime.getTime() + APPOINTMENT_DURATION * 60000),
    }));

    return {
      id: updatedBarber.id,
      name: updatedBarber.name,
      specialties: updatedBarber.specialties.map(
        (bs: any) => bs.specialty.name,
      ),
      bornAt: updatedBarber.bornAt,
      hiredAt: updatedBarber.hiredAt,
      busyTimes,
    };
  }

  async deleteBarberById(id: number): Promise<any> {
    return db.barber.delete({
      where: {
        id: id,
      },
    });
  }
}

export const barberRepository = new BarberRepository();

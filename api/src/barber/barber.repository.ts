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
    // Create barber and associate specialties
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
      },
    });

    return {
      id: createdBarber.id,
      name: createdBarber.name,
      specialties: createdBarber.specialties.map(
        (bs: any) => bs.specialty.name,
      ),
      bornAt: createdBarber.bornAt,
      hiredAt: createdBarber.hiredAt,
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
      },
    });

    if (!barber) {
      throw new Error("Barber not found");
    }

    return {
      id: barber.id,
      name: barber.name,
      specialties: barber.specialties.map((bs: any) => bs.specialty.name),
      bornAt: barber.bornAt,
      hiredAt: barber.hiredAt,
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
        },
      }),
      db.barber.count(),
    ]);

    return {
      data: barbers.map((barber: any) => ({
        id: barber.id,
        name: barber.name,
        specialties: barber.specialties.map((bs: any) => bs.specialty.name),
        bornAt: barber.bornAt,
        hiredAt: barber.hiredAt,
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  async updateBarber(barber: Barber): Promise<Barber> {
    // Delete existing specialty associations
    const dbAny = db as any;
    await dbAny.barberSpecialty.deleteMany({
      where: {
        barberId: barber.id,
      },
    });

    // Update barber and create new specialty associations
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
      },
    });

    return {
      id: updatedBarber.id,
      name: updatedBarber.name,
      specialties: updatedBarber.specialties.map(
        (bs: any) => bs.specialty.name,
      ),
      bornAt: updatedBarber.bornAt,
      hiredAt: updatedBarber.hiredAt,
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

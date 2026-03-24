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
    return db.barber.create({
      data: {
        name: barber.name,
        specialtyId: barber.specialtyId,
        bornAt: barber.bornAt,
        hiredAt: barber.hiredAt,
      },
    });
  }

  async getBarberById(id: number): Promise<Barber> {
    const barber = await db.barber.findFirst({
      where: {
        id: id,
      },
    });

    if (!barber) {
      throw new Error("Barber not found");
    }

    return {
      id: barber.id,
      name: barber.name,
      specialtyId: barber.specialtyId,
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
      db.barber.findMany({
        skip: offset,
        take: limit,
      }),
      db.barber.count(),
    ]);

    return {
      data: barbers.map((barber) => ({
        id: barber.id,
        name: barber.name,
        specialtyId: barber.specialtyId,
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
    const updatedBarber = await db.barber.update({
      where: {
        id: barber.id,
      },
      data: {
        name: barber.name,
        specialtyId: barber.specialtyId,
        bornAt: barber.bornAt,
        hiredAt: new Date(barber.hiredAt),
      },
    });

    return {
      id: updatedBarber.id,
      name: updatedBarber.name,
      specialtyId: updatedBarber.specialtyId,
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

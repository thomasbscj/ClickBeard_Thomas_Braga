import { Barber } from "./barber.model";
import { db } from "../repository/repository";

export interface IBarberRepository {
  createBarber(barber: Barber): Promise<Barber>;
  getBarberById(id: number): Promise<Barber>;
  getAllBarbers(): Promise<Barber[]>;
  updateBarber(barber: Barber): Promise<Barber>;
  deleteBarberById(id: number): Promise<any>;
}

class BarberRepository implements IBarberRepository {
  constructor() {}

  async createBarber(barber: Barber): Promise<Barber> {
    return db.barber.create({
      data: {
        name: barber.name,
        specialtyId: barber.specialtyId,
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
    };
  }

  async getAllBarbers(): Promise<Barber[]> {
    const barbers = await db.barber.findMany();

    return barbers.map((barber) => ({
      id: barber.id,
      name: barber.name,
      specialtyId: barber.specialtyId,
    }));
  }

  async updateBarber(barber: Barber): Promise<Barber> {
    const updatedBarber = await db.barber.update({
      where: {
        id: barber.id,
      },
      data: {
        name: barber.name,
        specialtyId: barber.specialtyId,
      },
    });

    return {
      id: updatedBarber.id,
      name: updatedBarber.name,
      specialtyId: updatedBarber.specialtyId,
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

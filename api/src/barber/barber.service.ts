import { Barber } from "./barber.model";
import { barberRepository } from "./barber.repository";
import type { IBarberRepository } from "./barber.repository";

interface IBarberService {
  createBarber(barber: Barber): Promise<Barber>;
  getBarberById(id: number): Promise<Barber>;
  getAllBarbers(): Promise<Barber[]>;
  updateBarber(barber: Barber): Promise<Barber>;
  deleteBarberById(id: number): Promise<void>;
}

class BarberService implements IBarberService {
  constructor(private barberRepository: IBarberRepository) {}

  async createBarber(barber: Barber): Promise<Barber> {
    return this.barberRepository.createBarber(barber);
  }

  async getBarberById(id: number): Promise<Barber> {
    return this.barberRepository.getBarberById(id);
  }

  async getAllBarbers(): Promise<Barber[]> {
    return this.barberRepository.getAllBarbers();
  }

  async updateBarber(barber: Barber): Promise<Barber> {
    return this.barberRepository.updateBarber(barber);
  }

  async deleteBarberById(id: number): Promise<void> {
    return this.barberRepository.deleteBarberById(id);
  }
}

export const barberService = new BarberService(barberRepository);

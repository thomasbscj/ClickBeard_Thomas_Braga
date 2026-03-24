import { Barber, BarberCreateInput } from "./barber.model";
import { barberRepository } from "./barber.repository";
import type { IBarberRepository } from "./barber.repository";
import { PaginationParams, PaginatedResponse } from "../types/types";

interface IBarberService {
  createBarber(barber: BarberCreateInput): Promise<Barber>;
  getBarberById(id: number): Promise<Barber>;
  getAllBarbers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Barber>>;
  updateBarber(barber: Barber): Promise<Barber>;
  deleteBarberById(id: number): Promise<void>;
}

export class BarberService implements IBarberService {
  constructor(private barberRepository: IBarberRepository) {}

  async createBarber(barber: BarberCreateInput): Promise<Barber> {
    return this.barberRepository.createBarber(barber);
  }

  async getBarberById(id: number): Promise<Barber> {
    return this.barberRepository.getBarberById(id);
  }

  async getAllBarbers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Barber>> {
    return this.barberRepository.getAllBarbers(pagination);
  }

  async updateBarber(barber: Barber): Promise<Barber> {
    return this.barberRepository.updateBarber(barber);
  }

  async deleteBarberById(id: number): Promise<void> {
    return this.barberRepository.deleteBarberById(id);
  }
}

export const barberService = new BarberService(barberRepository);

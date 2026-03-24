import { Specialty } from "./specialty.model";
import { specialtyRepository } from "./specialty.repository";
import type { ISpecialtyRepository } from "./specialty.repository";

interface ISpecialtyService {
  createSpecialty(specialty: Specialty): Promise<Specialty>;
  getSpecialtyByName(name: string): Promise<Specialty>;
  getAllSpecialties(): Promise<Specialty[]>;
  updateSpecialty(specialty: Specialty): Promise<Specialty>;
  deleteSpecialtyByName(name: string): Promise<void>;
}

export class SpecialtyService implements ISpecialtyService {
  constructor(private specialtyRepository: ISpecialtyRepository) {}

  async createSpecialty(specialty: Specialty): Promise<Specialty> {
    return this.specialtyRepository.createSpecialty(specialty);
  }

  async getSpecialtyByName(name: string): Promise<Specialty> {
    return this.specialtyRepository.getSpecialtyByName(name);
  }

  async getAllSpecialties(): Promise<Specialty[]> {
    return this.specialtyRepository.getAllSpecialties();
  }

  async updateSpecialty(specialty: Specialty): Promise<Specialty> {
    return this.specialtyRepository.updateSpecialty(specialty);
  }

  async deleteSpecialtyByName(name: string): Promise<void> {
    return this.specialtyRepository.deleteSpecialtyByName(name);
  }
}

export const specialtyService = new SpecialtyService(specialtyRepository);

import { Specialty } from "./specialty.model";
import { specialtyRepository } from "./specialty.repository";
import type { ISpecialtyRepository } from "./specialty.repository";
import { PaginationParams, PaginatedResponse } from "../types/types";

interface ISpecialtyService {
  createSpecialty(specialty: Specialty): Promise<Specialty>;
  getSpecialtyByName(name: string): Promise<Specialty>;
  getAllSpecialties(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Specialty>>;
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

  async getAllSpecialties(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Specialty>> {
    return this.specialtyRepository.getAllSpecialties(pagination);
  }

  async updateSpecialty(specialty: Specialty): Promise<Specialty> {
    return this.specialtyRepository.updateSpecialty(specialty);
  }

  async deleteSpecialtyByName(name: string): Promise<void> {
    return this.specialtyRepository.deleteSpecialtyByName(name);
  }
}

export const specialtyService = new SpecialtyService(specialtyRepository);

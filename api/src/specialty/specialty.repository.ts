import { Specialty } from "./specialty.model";
import { db } from "../repository/repository";
import { PaginationParams, PaginatedResponse } from "../types/types";

export interface ISpecialtyRepository {
  createSpecialty(specialty: Specialty): Promise<Specialty>;
  getSpecialtyByName(name: string): Promise<Specialty>;
  getAllSpecialties(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Specialty>>;
  updateSpecialty(specialty: Specialty): Promise<Specialty>;
  deleteSpecialtyByName(name: string): Promise<any>;
}

class SpecialtyRepository implements ISpecialtyRepository {
  constructor() {}

  async createSpecialty(specialty: Specialty): Promise<Specialty> {
    return db.specialty.create({
      data: {
        name: specialty.name,
        description: specialty.description,
      },
    });
  }

  async getSpecialtyByName(name: string): Promise<Specialty> {
    const specialty = await db.specialty.findFirst({
      where: {
        name: name,
      },
    });

    if (!specialty) {
      throw new Error("Specialty not found");
    }

    return {
      name: specialty.name,
      description: specialty.description,
    };
  }

  async getAllSpecialties(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Specialty>> {
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    const [specialties, total] = await Promise.all([
      db.specialty.findMany({
        skip: offset,
        take: limit,
      }),
      db.specialty.count(),
    ]);

    return {
      data: specialties.map((specialty) => ({
        name: specialty.name,
        description: specialty.description,
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  async updateSpecialty(specialty: Specialty): Promise<Specialty> {
    const updatedSpecialty = await db.specialty.update({
      where: {
        name: specialty.name,
      },
      data: {
        description: specialty.description,
      },
    });

    return {
      name: updatedSpecialty.name,
      description: updatedSpecialty.description,
    };
  }

  async deleteSpecialtyByName(name: string): Promise<any> {
    return db.specialty.delete({
      where: {
        name: name,
      },
    });
  }
}

export const specialtyRepository = new SpecialtyRepository();

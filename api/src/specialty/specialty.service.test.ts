import { describe, it, expect, beforeEach } from "vitest";
import { Specialty } from "./specialty.model";
import type { ISpecialtyRepository } from "./specialty.repository";
import { PaginatedResponse } from "../types/types";
import { SpecialtyService } from "./specialty.service";

// Mock hardcoded do repositório de Specialty
const mockSpecialtyRepository: ISpecialtyRepository = {
  createSpecialty: async (specialty: Specialty): Promise<Specialty> => {
    return {
      name: specialty.name,
      description: specialty.description,
    };
  },

  getSpecialtyByName: async (name: string): Promise<Specialty> => {
    const specialties = [
      {
        name: "Corte de Cabelo",
        description: "Serviço profissional de corte e estilo de cabelo",
      },
      {
        name: "Barba",
        description: "Serviço completo de aparação e design de barba",
      },
      {
        name: "Coloração",
        description: "Serviço de coloração e tingimento de cabelo",
      },
    ];

    const specialty = specialties.find((s) => s.name === name);
    if (!specialty) {
      throw new Error("Specialty not found");
    }
    return specialty;
  },

  getAllSpecialties: async (): Promise<PaginatedResponse<Specialty>> => {
    return {
      data: [
        {
          name: "Corte de Cabelo",
          description: "Serviço profissional de corte e estilo de cabelo",
        },
        {
          name: "Barba",
          description: "Serviço completo de aparação e design de barba",
        },
        {
          name: "Coloração",
          description: "Serviço de coloração e tingimento de cabelo",
        },
        {
          name: "Design de Sobrancelha",
          description: "Serviço de design e depilação de sobrancelha",
        },
        {
          name: "Lavagem",
          description: "Serviço de higienização e lavagem de cabelo",
        },
      ],
      pagination: { limit: 10, offset: 0, total: 5 },
    };
  },

  updateSpecialty: async (specialty: Specialty): Promise<Specialty> => {
    return {
      name: specialty.name,
      description: specialty.description,
    };
  },

  deleteSpecialtyByName: async (name: string): Promise<void> => {
    if (!name || name.trim() === "") {
      throw new Error("Invalid specialty name");
    }
    return;
  },
};

describe("SpecialtyService", () => {
  let specialtyService: SpecialtyService;

  beforeEach(() => {
    specialtyService = new SpecialtyService(mockSpecialtyRepository);
  });

  describe("createSpecialty", () => {
    it("should create a new specialty successfully", async () => {
      const specialtyInput: Specialty = {
        name: "Escova Progressiva",
        description: "Serviço de escova progressiva e alisamento de cabelo",
      };

      const result = await specialtyService.createSpecialty(specialtyInput);

      expect(result).toBeDefined();
      expect(result.name).toBe("Escova Progressiva");
      expect(result.description).toBe(
        "Serviço de escova progressiva e alisamento de cabelo",
      );
    });

    it("should preserve all specialty fields", async () => {
      const specialtyInput: Specialty = {
        name: "Permanente",
        description: "Serviço de ondulação permanente de cabelo",
      };

      const result = await specialtyService.createSpecialty(specialtyInput);

      expect(result.name).toBe(specialtyInput.name);
      expect(result.description).toBe(specialtyInput.description);
    });
  });

  describe("getSpecialtyByName", () => {
    it("should return a specialty by name", async () => {
      const result =
        await specialtyService.getSpecialtyByName("Corte de Cabelo");

      expect(result).toBeDefined();
      expect(result.name).toBe("Corte de Cabelo");
      expect(result.description).toBe(
        "Serviço profissional de corte e estilo de cabelo",
      );
    });

    it("should throw error when specialty not found", async () => {
      await expect(
        specialtyService.getSpecialtyByName("Inexistente"),
      ).rejects.toThrow("Specialty not found");
    });

    it("should find specialty with exact name match", async () => {
      const result = await specialtyService.getSpecialtyByName("Barba");

      expect(result.name).toBe("Barba");
      expect(result.description).toBe(
        "Serviço completo de aparação e design de barba",
      );
    });

    it("should find multiple specialties with correct names", async () => {
      const specialty1 = await specialtyService.getSpecialtyByName("Coloração");
      const specialty2 = await specialtyService.getSpecialtyByName("Barba");

      expect(specialty1.name).toBe("Coloração");
      expect(specialty2.name).toBe("Barba");
      expect(specialty1.description).not.toBe(specialty2.description);
    });
  });

  describe("getAllSpecialties", () => {
    it("should return all specialties", async () => {
      const result = await specialtyService.getAllSpecialties();

      expect(result).toBeDefined();
      expect(result.data.length).toBe(5);
      expect(result.pagination.total).toBe(5);
    });

    it("should return specialties with correct data", async () => {
      const result = await specialtyService.getAllSpecialties();

      expect(result.data[0]!.name).toBe("Corte de Cabelo");
      expect(result.data[1]!.name).toBe("Barba");
      expect(result.data[2]!.name).toBe("Coloração");
      expect(result.data[3]!.name).toBe("Design de Sobrancelha");
      expect(result.data[4]!.name).toBe("Lavagem");
    });

    it("should return specialties with all required fields", async () => {
      const result = await specialtyService.getAllSpecialties();

      result.data.forEach((specialty) => {
        expect(specialty.name).toBeDefined();
        expect(specialty.description).toBeDefined();
        expect(typeof specialty.name).toBe("string");
        expect(typeof specialty.description).toBe("string");
      });
    });

    it("should return at least one specialty", async () => {
      const result = await specialtyService.getAllSpecialties();

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("updateSpecialty", () => {
    it("should update a specialty successfully", async () => {
      const updatedSpecialty: Specialty = {
        name: "Corte de Cabelo Premium",
        description: "Serviço premium de corte e estilo de cabelo",
      };

      const result = await specialtyService.updateSpecialty(updatedSpecialty);

      expect(result).toBeDefined();
      expect(result.name).toBe("Corte de Cabelo Premium");
      expect(result.description).toBe(
        "Serviço premium de corte e estilo de cabelo",
      );
    });

    it("should preserve all specialty fields on update", async () => {
      const updatedSpecialty: Specialty = {
        name: "Barba Deluxe",
        description: "Serviço deluxe de aparação e design de barba",
      };

      const result = await specialtyService.updateSpecialty(updatedSpecialty);

      expect(result.name).toBe(updatedSpecialty.name);
      expect(result.description).toBe(updatedSpecialty.description);
    });

    it("should update specialty with new description", async () => {
      const updatedSpecialty: Specialty = {
        name: "Coloração",
        description: "Novo serviço de coloração com produtos premium",
      };

      const result = await specialtyService.updateSpecialty(updatedSpecialty);

      expect(result.description).toBe(
        "Novo serviço de coloração com produtos premium",
      );
    });
  });

  describe("deleteSpecialtyByName", () => {
    it("should delete a specialty successfully", async () => {
      await expect(
        specialtyService.deleteSpecialtyByName("Corte de Cabelo"),
      ).resolves.not.toThrow();
    });

    it("should return void on successful deletion", async () => {
      const result = await specialtyService.deleteSpecialtyByName("Barba");

      expect(result).toBeUndefined();
    });

    it("should throw error for empty specialty name", async () => {
      await expect(specialtyService.deleteSpecialtyByName("")).rejects.toThrow(
        "Invalid specialty name",
      );
    });

    it("should throw error for whitespace only specialty name", async () => {
      await expect(
        specialtyService.deleteSpecialtyByName("   "),
      ).rejects.toThrow("Invalid specialty name");
    });

    it("should delete specialty with valid name", async () => {
      const result = await specialtyService.deleteSpecialtyByName("Coloração");

      expect(result).toBeUndefined();
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { Barber, BarberCreateInput } from "./barber.model";
import type { IBarberRepository } from "./barber.repository";
import { PaginatedResponse } from "../types/types";
import { BarberService } from "./barber.service";

const mockBarberRepository: IBarberRepository = {
  createBarber: async (barber: BarberCreateInput): Promise<Barber> => {
    return {
      id: 1,
      name: barber.name,
      specialties: barber.specialties,
      bornAt: barber.bornAt,
      hiredAt: barber.hiredAt,
    };
  },

  getBarberById: async (id: number): Promise<Barber> => {
    if (id === 1) {
      return {
        id: 1,
        name: "João Silva",
        specialties: ["corte-cabelo", "barba"],
        bornAt: 1990,
        hiredAt: new Date("2020-01-15"),
      };
    }
    if (id === 2) {
      return {
        id: 2,
        name: "Pedro Santos",
        specialties: ["barba", "design-sobrancelha"],
        bornAt: 1985,
        hiredAt: new Date("2019-06-20"),
      };
    }
    throw new Error("Barber not found");
  },

  getAllBarbers: async (): Promise<PaginatedResponse<Barber>> => {
    return {
      data: [
        {
          id: 1,
          name: "João Silva",
          specialties: ["corte-cabelo", "barba"],
          bornAt: 1990,
          hiredAt: new Date("2020-01-15"),
        },
        {
          id: 2,
          name: "Pedro Santos",
          specialties: ["barba", "design-sobrancelha"],
          bornAt: 1985,
          hiredAt: new Date("2019-06-20"),
        },
        {
          id: 3,
          name: "Carlos Costa",
          specialties: ["coloracao", "escova-progressiva", "lavagem"],
          bornAt: 1992,
          hiredAt: new Date("2021-03-10"),
        },
      ],
      pagination: { limit: 10, offset: 0, total: 3 },
    };
  },

  updateBarber: async (barber: Barber): Promise<Barber> => {
    return {
      id: barber.id,
      name: barber.name,
      specialties: barber.specialties,
      bornAt: barber.bornAt,
      hiredAt: barber.hiredAt,
    };
  },

  deleteBarberById: async (id: number): Promise<void> => {
    if (id < 1) {
      throw new Error("Invalid barber ID");
    }
    return;
  },
};

describe("BarberService", () => {
  let barberService: BarberService;

  beforeEach(() => {
    barberService = new BarberService(mockBarberRepository);
  });

  describe("createBarber", () => {
    it("should create a new barber successfully", async () => {
      const barberInput: BarberCreateInput = {
        name: "Ana Maria",
        specialties: ["design-sobrancelha", "lavagem"],
        bornAt: 1995,
        hiredAt: new Date("2022-05-01"),
      };

      const result = await barberService.createBarber(barberInput);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe("Ana Maria");
      expect(result.specialties).toEqual(["design-sobrancelha", "lavagem"]);
      expect(result.bornAt).toBe(1995);
    });

    it("should preserve all barber input fields", async () => {
      const barberInput: BarberCreateInput = {
        name: "Marcos Oliveira",
        specialties: ["corte-cabelo", "barba", "design-sobrancelha"],
        bornAt: 1988,
        hiredAt: new Date("2018-11-30"),
      };

      const result = await barberService.createBarber(barberInput);

      expect(result.name).toBe(barberInput.name);
      expect(result.specialties).toEqual(barberInput.specialties);
      expect(result.bornAt).toBe(barberInput.bornAt);
      expect(result.hiredAt).toEqual(barberInput.hiredAt);
    });

    it("should handle multiple specialties for a barber", async () => {
      const barberInput: BarberCreateInput = {
        name: "Multi Specialist",
        specialties: ["corte-cabelo", "barba", "coloracao"],
        bornAt: 1990,
        hiredAt: new Date("2020-01-01"),
      };

      const result = await barberService.createBarber(barberInput);

      expect(result.specialties.length).toBe(3);
      expect(result.specialties).toContain("corte-cabelo");
      expect(result.specialties).toContain("barba");
      expect(result.specialties).toContain("coloracao");
    });
  });

  describe("getBarberById", () => {
    it("should return a barber by id", async () => {
      const result = await barberService.getBarberById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe("João Silva");
      expect(result.specialties).toBeDefined();
    });

    it("should throw error when barber not found", async () => {
      await expect(barberService.getBarberById(999)).rejects.toThrow(
        "Barber not found",
      );
    });

    it("should return correct barber details with multiple specialties", async () => {
      const result = await barberService.getBarberById(1);

      expect(result.bornAt).toBe(1990);
      expect(result.hiredAt).toEqual(new Date("2020-01-15"));
      expect(result.specialties).toEqual(["corte-cabelo", "barba"]);
    });

    it("should return barber with multiple specialties", async () => {
      const result = await barberService.getBarberById(2);

      expect(result.specialties.length).toBeGreaterThan(1);
      expect(result.specialties).toContain("barba");
    });
  });

  describe("getAllBarbers", () => {
    it("should return all barbers", async () => {
      const result = await barberService.getAllBarbers();

      expect(result).toBeDefined();
      expect(result.data.length).toBe(3);
      expect(result.pagination.total).toBe(3);
    });

    it("should return barbers with correct data", async () => {
      const result = await barberService.getAllBarbers();

      expect(result.data[0]!.name).toBe("João Silva");
      expect(result.data[1]!.name).toBe("Pedro Santos");
      expect(result.data[2]!.name).toBe("Carlos Costa");
    });

    it("should return barbers with all required fields including specialties", async () => {
      const result = await barberService.getAllBarbers();

      result.data.forEach((barber: Barber) => {
        expect(barber.id).toBeDefined();
        expect(barber.name).toBeDefined();
        expect(barber.specialties).toBeDefined();
        expect(Array.isArray(barber.specialties)).toBe(true);
        expect(barber.bornAt).toBeDefined();
        expect(barber.hiredAt).toBeDefined();
      });
    });

    it("should return barbers with multiple specialties", async () => {
      const result = await barberService.getAllBarbers();

      const barberWithMultipleSpecialties = result.data.find(
        (b) => b.specialties.length > 1,
      );
      expect(barberWithMultipleSpecialties).toBeDefined();
      expect(barberWithMultipleSpecialties!.specialties.length).toBeGreaterThan(
        1,
      );
    });
  });

  describe("updateBarber", () => {
    it("should update a barber successfully", async () => {
      const updatedBarber: Barber = {
        id: 1,
        name: "João Silva Updated",
        specialties: ["corte-cabelo", "coloracao"],
        bornAt: 1991,
        hiredAt: new Date("2020-01-15"),
      };

      const result = await barberService.updateBarber(updatedBarber);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe("João Silva Updated");
      expect(result.specialties).toEqual(["corte-cabelo", "coloracao"]);
    });

    it("should preserve all barber fields on update", async () => {
      const updatedBarber: Barber = {
        id: 2,
        name: "Pedro Santos Updated",
        specialties: ["barba", "coloracao", "design-sobrancelha"],
        bornAt: 1986,
        hiredAt: new Date("2019-06-20"),
      };

      const result = await barberService.updateBarber(updatedBarber);

      expect(result.id).toBe(updatedBarber.id);
      expect(result.name).toBe(updatedBarber.name);
      expect(result.specialties).toEqual(updatedBarber.specialties);
      expect(result.bornAt).toBe(updatedBarber.bornAt);
      expect(result.hiredAt).toEqual(updatedBarber.hiredAt);
    });

    it("should update barber specialties", async () => {
      const updatedBarber: Barber = {
        id: 1,
        name: "João Silva",
        specialties: ["barba", "lavagem", "design-sobrancelha"],
        bornAt: 1990,
        hiredAt: new Date("2020-01-15"),
      };

      const result = await barberService.updateBarber(updatedBarber);

      expect(result.specialties).toEqual([
        "barba",
        "lavagem",
        "design-sobrancelha",
      ]);
    });
  });

  describe("deleteBarberById", () => {
    it("should delete a barber successfully", async () => {
      await expect(barberService.deleteBarberById(1)).resolves.not.toThrow();
    });

    it("should return void on successful deletion", async () => {
      const result = await barberService.deleteBarberById(2);

      expect(result).toBeUndefined();
    });

    it("should throw error for invalid barber ID", async () => {
      await expect(barberService.deleteBarberById(-1)).rejects.toThrow(
        "Invalid barber ID",
      );
    });

    it("should throw error for zero ID", async () => {
      await expect(barberService.deleteBarberById(0)).rejects.toThrow(
        "Invalid barber ID",
      );
    });
  });
});

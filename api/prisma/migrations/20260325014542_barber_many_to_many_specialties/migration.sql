/*
  Warnings:

  - You are about to drop the column `specialtyId` on the `Barber` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Barber" DROP CONSTRAINT "Barber_specialtyId_fkey";

-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "specialtyId";

-- CreateTable
CREATE TABLE "BarberSpecialty" (
    "id" SERIAL NOT NULL,
    "barberId" INTEGER NOT NULL,
    "specialtyName" TEXT NOT NULL,

    CONSTRAINT "BarberSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BarberSpecialty_barberId_specialtyName_key" ON "BarberSpecialty"("barberId", "specialtyName");

-- AddForeignKey
ALTER TABLE "BarberSpecialty" ADD CONSTRAINT "BarberSpecialty_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberSpecialty" ADD CONSTRAINT "BarberSpecialty_specialtyName_fkey" FOREIGN KEY ("specialtyName") REFERENCES "Specialty"("name") ON DELETE CASCADE ON UPDATE CASCADE;

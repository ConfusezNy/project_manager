/*
  Warnings:

  - You are about to drop the column `description` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `Users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_teamId_fkey";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "description",
DROP COLUMN "semester";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "teamId";

/*
  Warnings:

  - You are about to drop the column `team_deadline` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "team_deadline",
ADD COLUMN     "team_locked" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - You are about to drop the column `advisorName` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupNumber,section_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Team_groupNumber_key";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "advisorName",
DROP COLUMN "status";

-- CreateIndex
CREATE UNIQUE INDEX "Team_groupNumber_section_id_key" ON "Team"("groupNumber", "section_id");

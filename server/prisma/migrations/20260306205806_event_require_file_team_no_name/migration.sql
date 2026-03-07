/*
  Warnings:

  - You are about to drop the column `order` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "order",
DROP COLUMN "type",
ADD COLUMN     "requireFile" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "name";

-- DropEnum
DROP TYPE "EventType";

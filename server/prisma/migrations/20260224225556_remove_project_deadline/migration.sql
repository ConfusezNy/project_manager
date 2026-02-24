/*
  Warnings:

  - The values [A_PLUS] on the enum `GradeScore` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `project_deadline` on the `Section` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'PRESENTATION';
ALTER TYPE "EventType" ADD VALUE 'MEETING';
ALTER TYPE "EventType" ADD VALUE 'PROPOSAL';

-- AlterEnum
BEGIN;
CREATE TYPE "GradeScore_new" AS ENUM ('A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_PLUS', 'D', 'F');
ALTER TABLE "Grade" ALTER COLUMN "score" TYPE "GradeScore_new" USING ("score"::text::"GradeScore_new");
ALTER TYPE "GradeScore" RENAME TO "GradeScore_old";
ALTER TYPE "GradeScore_new" RENAME TO "GradeScore";
DROP TYPE "public"."GradeScore_old";
COMMIT;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "project_deadline";

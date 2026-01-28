/*
  Migration: Remove section_id from Teammember
  
  Changes:
  1. Drop section_id FK and column from Teammember
  2. Drop old unique constraint on [user_id, section_id]
  3. Add new unique constraint on [user_id, team_id]
*/

-- DropForeignKey (remove Teammember -> Section FK)
ALTER TABLE "Teammember" DROP CONSTRAINT IF EXISTS "Teammember_section_id_fkey";

-- DropIndex (old unique constraint)
DROP INDEX IF EXISTS "Teammember_user_id_section_id_key";

-- AlterTable: Drop section_id from Teammember
ALTER TABLE "Teammember" DROP COLUMN IF EXISTS "section_id";

-- CreateIndex (new unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS "Teammember_user_id_team_id_key" ON "Teammember"("user_id", "team_id");

/*
  Warnings:

  - A unique constraint covering the columns `[section_code,term_id]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Section_section_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_code_term_id_key" ON "Section"("section_code", "term_id");

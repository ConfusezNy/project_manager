/*
  Warnings:

  - You are about to drop the column `teamname` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupNumber]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupNumber` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "teamname",
ADD COLUMN     "advisorName" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "groupNumber" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "semester" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'รออนุมัติหัวข้อ',
ADD COLUMN     "topicThai" TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "teamId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Team_groupNumber_key" ON "Team"("groupNumber");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

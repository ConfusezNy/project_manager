/*
  Warnings:

  - The primary key for the `Attachment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Attachment_id` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `Student_ID` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Project` table. All the data in the column will be lost.
  - The primary key for the `ProjectAdvisor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `projectId` on the `Task` table. All the data in the column will be lost.
  - The primary key for the `TaskAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `course_id` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `term_id` on the `Team` table. All the data in the column will be lost.
  - The primary key for the `Teammember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[team_id]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[project_id,advisor_id]` on the table `ProjectAdvisor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[task_id,user_id]` on the table `TaskAssignment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,section_id]` on the table `Teammember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fileUrl` on table `Attachment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `filename` on table `Attachment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `task_id` on table `Attachment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uploadedBy_id` on table `Attachment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `text` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isRead` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `task_id` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `student_id` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Made the column `score` on table `Grade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `actor_user_id` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isRead` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `event_type` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `projectname` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `team_id` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `project_id` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorUserId` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `section_id` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section_id` to the `Teammember` table without a default value. This is not possible if the table is not empty.
  - Made the column `joinedAt` on table `Teammember` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `endDate` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Made the column `academicYear` on table `Term` required. This step will fail if there are existing NULL values in that column.
  - Made the column `semester` on table `Term` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('PRE_PROJECT', 'PROJECT');

-- CreateEnum
CREATE TYPE "StudyType" AS ENUM ('REG', 'LE');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_task_id_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_uploadedBy_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_task_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_Student_ID_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_actor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_team_id_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_authorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_term_id_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_pkey",
DROP COLUMN "Attachment_id",
ADD COLUMN     "attachment_id" SERIAL NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL,
ALTER COLUMN "fileUrl" SET DATA TYPE TEXT,
ALTER COLUMN "filename" SET NOT NULL,
ALTER COLUMN "filename" SET DATA TYPE TEXT,
ALTER COLUMN "task_id" SET NOT NULL,
ALTER COLUMN "uploadedBy_id" SET NOT NULL,
ADD CONSTRAINT "Attachment_pkey" PRIMARY KEY ("attachment_id");

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "text" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "isRead" SET NOT NULL,
ALTER COLUMN "task_id" SET NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "Student_ID",
ADD COLUMN     "student_id" VARCHAR(13) NOT NULL,
ALTER COLUMN "score" SET NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "actor_user_id" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "message" SET NOT NULL,
ALTER COLUMN "link" SET DATA TYPE TEXT,
ALTER COLUMN "isRead" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "event_type" SET NOT NULL,
ALTER COLUMN "event_type" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "project_type" TEXT,
ADD COLUMN     "projectnameEng" VARCHAR(100),
ADD COLUMN     "status" TEXT,
ALTER COLUMN "projectname" SET NOT NULL,
ALTER COLUMN "team_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProjectAdvisor" DROP CONSTRAINT "ProjectAdvisor_pkey",
ADD COLUMN     "projectAdvisor_id" SERIAL NOT NULL,
ADD CONSTRAINT "ProjectAdvisor_pkey" PRIMARY KEY ("projectAdvisor_id");

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "projectId",
ADD COLUMN     "project_id" INTEGER NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "tags" SET DATA TYPE TEXT,
ALTER COLUMN "authorUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_pkey",
ADD COLUMN     "taskAssignment_id" SERIAL NOT NULL,
ADD CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskAssignment_id");

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "course_id",
DROP COLUMN "term_id",
ADD COLUMN     "section_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Teammember" DROP CONSTRAINT "Teammember_pkey",
ADD COLUMN     "section_id" INTEGER NOT NULL,
ADD COLUMN     "teammember_id" SERIAL NOT NULL,
ALTER COLUMN "joinedAt" SET NOT NULL,
ALTER COLUMN "joinedAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Teammember_pkey" PRIMARY KEY ("teammember_id");

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "academicYear" SET NOT NULL,
ALTER COLUMN "semester" SET NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "profilePicture" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Course";

-- CreateTable
CREATE TABLE "Section" (
    "section_id" SERIAL NOT NULL,
    "section_code" TEXT NOT NULL,
    "course_type" "CourseType" NOT NULL,
    "study_type" "StudyType" NOT NULL,
    "min_team_size" INTEGER NOT NULL,
    "max_team_size" INTEGER NOT NULL,
    "project_deadline" TIMESTAMP(3) NOT NULL,
    "team_deadline" TIMESTAMP(3) NOT NULL,
    "term_id" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "Section_Enrollment" (
    "section_enroll_id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "users_id" VARCHAR(13) NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_Enrollment_pkey" PRIMARY KEY ("section_enroll_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_code_key" ON "Section"("section_code");

-- CreateIndex
CREATE UNIQUE INDEX "Section_Enrollment_section_id_users_id_key" ON "Section_Enrollment"("section_id", "users_id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_team_id_key" ON "Project"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAdvisor_project_id_advisor_id_key" ON "ProjectAdvisor"("project_id", "advisor_id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_task_id_user_id_key" ON "TaskAssignment"("task_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teammember_user_id_section_id_key" ON "Teammember"("user_id", "section_id");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section_Enrollment" ADD CONSTRAINT "Section_Enrollment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section_Enrollment" ADD CONSTRAINT "Section_Enrollment_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teammember" ADD CONSTRAINT "Teammember_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedBy_id_fkey" FOREIGN KEY ("uploadedBy_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

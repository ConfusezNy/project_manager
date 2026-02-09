-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PROGRESS_REPORT', 'DOCUMENT', 'POSTER', 'EXAM', 'FINAL_SUBMISSION', 'SEMINAR');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'NEEDS_REVISION', 'APPROVED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Event" (
    "event_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "EventType" NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "section_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submission_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "file" TEXT,
    "feedback" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" VARCHAR(13),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submission_event_id_team_id_key" ON "Submission"("event_id", "team_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('PRE_PROJECT', 'PROJECT');

-- CreateEnum
CREATE TYPE "GradeScore" AS ENUM ('A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_PLUS', 'D', 'F');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADVISOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "StudyType" AS ENUM ('REG', 'LE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'NEEDS_REVISION', 'APPROVED');

-- CreateTable
CREATE TABLE "Attachment" (
    "fileUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "task_id" INTEGER NOT NULL,
    "uploadedBy_id" VARCHAR(13) NOT NULL,
    "attachment_id" SERIAL NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "task_id" INTEGER NOT NULL,
    "user_id" VARCHAR(13) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "evaluator_id" VARCHAR(13) NOT NULL,
    "score" "GradeScore" NOT NULL,
    "student_id" VARCHAR(13) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" VARCHAR(13) NOT NULL,
    "actor_user_id" VARCHAR(13),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" TEXT NOT NULL,
    "team_id" INTEGER,
    "task_id" INTEGER,
    "project_id" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" SERIAL NOT NULL,
    "projectname" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "team_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_type" TEXT,
    "projectnameEng" VARCHAR(100),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "ProjectAdvisor" (
    "project_id" INTEGER NOT NULL,
    "advisor_id" VARCHAR(13) NOT NULL,
    "projectAdvisor_id" SERIAL NOT NULL,

    CONSTRAINT "ProjectAdvisor_pkey" PRIMARY KEY ("projectAdvisor_id")
);

-- CreateTable
CREATE TABLE "Section" (
    "section_id" SERIAL NOT NULL,
    "section_code" TEXT NOT NULL,
    "course_type" "CourseType" NOT NULL,
    "study_type" "StudyType" NOT NULL,
    "min_team_size" INTEGER NOT NULL,
    "max_team_size" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "team_locked" BOOLEAN NOT NULL DEFAULT false,

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

-- CreateTable
CREATE TABLE "Task" (
    "task_id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) NOT NULL,
    "priority" VARCHAR(20) NOT NULL,
    "tags" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "authorUserId" VARCHAR(13) NOT NULL,
    "project_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "user_id" VARCHAR(13) NOT NULL,
    "task_id" INTEGER NOT NULL,
    "taskAssignment_id" SERIAL NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskAssignment_id")
);

-- CreateTable
CREATE TABLE "Team" (
    "team_id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "advisorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "groupNumber" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'รออนุมัติหัวข้อ',
    "topicThai" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "Teammember" (
    "team_id" INTEGER NOT NULL,
    "user_id" VARCHAR(13) NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teammember_id" SERIAL NOT NULL,

    CONSTRAINT "Teammember_pkey" PRIMARY KEY ("teammember_id")
);

-- CreateTable
CREATE TABLE "Term" (
    "term_id" SERIAL NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "users_id" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255),
    "titles" VARCHAR(50),
    "firstname" VARCHAR(50),
    "lastname" VARCHAR(50),
    "tel_number" VARCHAR(10),
    "email" VARCHAR(100),
    "profilePicture" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "teamId" INTEGER,
    "expertiseAreas" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "Event" (
    "event_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "section_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requireFile" BOOLEAN NOT NULL DEFAULT false,

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

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_team_id_key" ON "Project"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAdvisor_project_id_advisor_id_key" ON "ProjectAdvisor"("project_id", "advisor_id");

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_code_term_id_key" ON "Section"("section_code", "term_id");

-- CreateIndex
CREATE UNIQUE INDEX "Section_Enrollment_section_id_users_id_key" ON "Section_Enrollment"("section_id", "users_id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_task_id_user_id_key" ON "TaskAssignment"("task_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_groupNumber_key" ON "Team"("groupNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Teammember_user_id_team_id_key" ON "Teammember"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_event_id_team_id_key" ON "Submission"("event_id", "team_id");

-- CreateIndex
CREATE INDEX "OtpCode_email_idx" ON "OtpCode"("email");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedBy_id_fkey" FOREIGN KEY ("uploadedBy_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAdvisor" ADD CONSTRAINT "ProjectAdvisor_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAdvisor" ADD CONSTRAINT "ProjectAdvisor_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section_Enrollment" ADD CONSTRAINT "Section_Enrollment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section_Enrollment" ADD CONSTRAINT "Section_Enrollment_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teammember" ADD CONSTRAINT "Teammember_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teammember" ADD CONSTRAINT "Teammember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

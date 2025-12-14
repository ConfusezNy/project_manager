-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADVISOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "GradeScore" AS ENUM ('A', 'A_PLUS', 'B', 'B_PLUS', 'C', 'C_PLUS', 'D', 'D_PLUS');

-- CreateTable
CREATE TABLE "Users" (
    "users_id" VARCHAR(13) NOT NULL,
    "passwordHash" VARCHAR(255),
    "titles" VARCHAR(20),
    "firstname" VARCHAR(50),
    "lastname" VARCHAR(50),
    "tel_number" VARCHAR(10),
    "email" VARCHAR(100),
    "profilePicture" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "Team" (
    "team_id" SERIAL NOT NULL,
    "teamname" VARCHAR(3) NOT NULL,
    "course_id" VARCHAR(10),
    "term_id" INTEGER,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" VARCHAR(10) NOT NULL,
    "courseName" VARCHAR(11),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "Term" (
    "term_id" SERIAL NOT NULL,
    "academicYear" INTEGER,
    "semester" INTEGER,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "Teammember" (
    "team_id" INTEGER NOT NULL,
    "user_id" VARCHAR(13) NOT NULL,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "Teammember_pkey" PRIMARY KEY ("team_id","user_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" SERIAL NOT NULL,
    "projectname" VARCHAR(100),
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "team_id" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "ProjectAdvisor" (
    "project_id" INTEGER NOT NULL,
    "advisor_id" VARCHAR(13) NOT NULL,

    CONSTRAINT "ProjectAdvisor_pkey" PRIMARY KEY ("project_id","advisor_id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" SERIAL NOT NULL,
    "title" VARCHAR(100),
    "description" TEXT,
    "status" VARCHAR(20),
    "priority" VARCHAR(20),
    "tags" VARCHAR(50),
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "projectId" INTEGER,
    "authorUserId" VARCHAR(13),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "user_id" VARCHAR(13) NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("user_id","task_id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "Attachment_id" SERIAL NOT NULL,
    "fileUrl" VARCHAR(255),
    "filename" VARCHAR(100),
    "task_id" INTEGER,
    "uploadedBy_id" VARCHAR(13),

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("Attachment_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN DEFAULT false,
    "task_id" INTEGER,
    "user_id" VARCHAR(13),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" SERIAL NOT NULL,
    "Student_ID" VARCHAR(13) NOT NULL,
    "project_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "evaluator_id" VARCHAR(13) NOT NULL,
    "score" "GradeScore",

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" VARCHAR(13),
    "actor_user_id" VARCHAR(13),
    "title" VARCHAR(100),
    "message" TEXT,
    "link" VARCHAR(255),
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "event_type" VARCHAR(50),
    "team_id" INTEGER,
    "task_id" INTEGER,
    "project_id" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teammember" ADD CONSTRAINT "Teammember_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teammember" ADD CONSTRAINT "Teammember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAdvisor" ADD CONSTRAINT "ProjectAdvisor_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAdvisor" ADD CONSTRAINT "ProjectAdvisor_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedBy_id_fkey" FOREIGN KEY ("uploadedBy_id") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_Student_ID_fkey" FOREIGN KEY ("Student_ID") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE SET NULL ON UPDATE CASCADE;

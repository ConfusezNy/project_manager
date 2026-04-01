--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg110+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CourseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseType" AS ENUM (
    'PRE_PROJECT',
    'PROJECT'
);


ALTER TYPE public."CourseType" OWNER TO postgres;

--
-- Name: GradeScore; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GradeScore" AS ENUM (
    'A',
    'B_PLUS',
    'B',
    'C_PLUS',
    'C',
    'D_PLUS',
    'D',
    'F'
);


ALTER TYPE public."GradeScore" OWNER TO postgres;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ProjectStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'ADVISOR',
    'STUDENT'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: StudyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StudyType" AS ENUM (
    'REG',
    'LE'
);


ALTER TYPE public."StudyType" OWNER TO postgres;

--
-- Name: SubmissionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubmissionStatus" AS ENUM (
    'PENDING',
    'SUBMITTED',
    'NEEDS_REVISION',
    'APPROVED'
);


ALTER TYPE public."SubmissionStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attachment" (
    "fileUrl" text NOT NULL,
    filename text NOT NULL,
    task_id integer NOT NULL,
    "uploadedBy_id" character varying(13) NOT NULL,
    attachment_id integer NOT NULL
);


ALTER TABLE public."Attachment" OWNER TO postgres;

--
-- Name: Attachment_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Attachment_attachment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Attachment_attachment_id_seq" OWNER TO postgres;

--
-- Name: Attachment_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Attachment_attachment_id_seq" OWNED BY public."Attachment".attachment_id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comment" (
    comment_id integer NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    task_id integer NOT NULL,
    user_id character varying(13) NOT NULL
);


ALTER TABLE public."Comment" OWNER TO postgres;

--
-- Name: Comment_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Comment_comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Comment_comment_id_seq" OWNER TO postgres;

--
-- Name: Comment_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Comment_comment_id_seq" OWNED BY public."Comment".comment_id;


--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    event_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "dueDate" timestamp(3) without time zone NOT NULL,
    section_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "requireFile" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: Event_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Event_event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Event_event_id_seq" OWNER TO postgres;

--
-- Name: Event_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Event_event_id_seq" OWNED BY public."Event".event_id;


--
-- Name: Grade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Grade" (
    grade_id integer NOT NULL,
    project_id integer NOT NULL,
    term_id integer NOT NULL,
    evaluator_id character varying(13) NOT NULL,
    score public."GradeScore" NOT NULL,
    student_id character varying(13) NOT NULL
);


ALTER TABLE public."Grade" OWNER TO postgres;

--
-- Name: Grade_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Grade_grade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Grade_grade_id_seq" OWNER TO postgres;

--
-- Name: Grade_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Grade_grade_id_seq" OWNED BY public."Grade".grade_id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    notification_id integer NOT NULL,
    user_id character varying(13) NOT NULL,
    actor_user_id character varying(13),
    title text NOT NULL,
    message text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    event_type text NOT NULL,
    team_id integer,
    task_id integer,
    project_id integer
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Notification_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notification_notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Notification_notification_id_seq" OWNER TO postgres;

--
-- Name: Notification_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notification_notification_id_seq" OWNED BY public."Notification".notification_id;


--
-- Name: OtpCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OtpCode" (
    id integer NOT NULL,
    email text NOT NULL,
    otp character varying(6) NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "failCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OtpCode" OWNER TO postgres;

--
-- Name: OtpCode_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OtpCode_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OtpCode_id_seq" OWNER TO postgres;

--
-- Name: OtpCode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OtpCode_id_seq" OWNED BY public."OtpCode".id;


--
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    project_id integer NOT NULL,
    projectname character varying(100) NOT NULL,
    description text,
    team_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    project_type text,
    "projectnameEng" character varying(100),
    "isArchived" boolean DEFAULT false NOT NULL,
    status public."ProjectStatus" DEFAULT 'DRAFT'::public."ProjectStatus" NOT NULL
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- Name: ProjectAdvisor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectAdvisor" (
    project_id integer NOT NULL,
    advisor_id character varying(13) NOT NULL,
    "projectAdvisor_id" integer NOT NULL,
    advisor_role text DEFAULT 'PRIMARY'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL
);


ALTER TABLE public."ProjectAdvisor" OWNER TO postgres;

--
-- Name: ProjectAdvisor_projectAdvisor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProjectAdvisor_projectAdvisor_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProjectAdvisor_projectAdvisor_id_seq" OWNER TO postgres;

--
-- Name: ProjectAdvisor_projectAdvisor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProjectAdvisor_projectAdvisor_id_seq" OWNED BY public."ProjectAdvisor"."projectAdvisor_id";


--
-- Name: Project_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Project_project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Project_project_id_seq" OWNER TO postgres;

--
-- Name: Project_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Project_project_id_seq" OWNED BY public."Project".project_id;


--
-- Name: Section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Section" (
    section_id integer NOT NULL,
    section_code text NOT NULL,
    course_type public."CourseType" NOT NULL,
    study_type public."StudyType" NOT NULL,
    min_team_size integer NOT NULL,
    max_team_size integer NOT NULL,
    term_id integer NOT NULL,
    team_locked boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Section" OWNER TO postgres;

--
-- Name: Section_Enrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Section_Enrollment" (
    section_enroll_id integer NOT NULL,
    section_id integer NOT NULL,
    users_id character varying(13) NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Section_Enrollment" OWNER TO postgres;

--
-- Name: Section_Enrollment_section_enroll_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Section_Enrollment_section_enroll_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Section_Enrollment_section_enroll_id_seq" OWNER TO postgres;

--
-- Name: Section_Enrollment_section_enroll_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Section_Enrollment_section_enroll_id_seq" OWNED BY public."Section_Enrollment".section_enroll_id;


--
-- Name: Section_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Section_section_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Section_section_id_seq" OWNER TO postgres;

--
-- Name: Section_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Section_section_id_seq" OWNED BY public."Section".section_id;


--
-- Name: Submission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Submission" (
    submission_id integer NOT NULL,
    event_id integer NOT NULL,
    team_id integer NOT NULL,
    status public."SubmissionStatus" DEFAULT 'PENDING'::public."SubmissionStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    file text,
    feedback text,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" character varying(13),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Submission" OWNER TO postgres;

--
-- Name: Submission_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Submission_submission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Submission_submission_id_seq" OWNER TO postgres;

--
-- Name: Submission_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Submission_submission_id_seq" OWNED BY public."Submission".submission_id;


--
-- Name: Task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Task" (
    task_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    priority character varying(20) NOT NULL,
    tags text,
    "startDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    "authorUserId" character varying(13) NOT NULL,
    project_id integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Task" OWNER TO postgres;

--
-- Name: TaskAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskAssignment" (
    user_id character varying(13) NOT NULL,
    task_id integer NOT NULL,
    "taskAssignment_id" integer NOT NULL
);


ALTER TABLE public."TaskAssignment" OWNER TO postgres;

--
-- Name: TaskAssignment_taskAssignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TaskAssignment_taskAssignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TaskAssignment_taskAssignment_id_seq" OWNER TO postgres;

--
-- Name: TaskAssignment_taskAssignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TaskAssignment_taskAssignment_id_seq" OWNED BY public."TaskAssignment"."taskAssignment_id";


--
-- Name: Task_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Task_task_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Task_task_id_seq" OWNER TO postgres;

--
-- Name: Task_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Task_task_id_seq" OWNED BY public."Task".task_id;


--
-- Name: Team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Team" (
    team_id integer NOT NULL,
    section_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "groupNumber" text NOT NULL
);


ALTER TABLE public."Team" OWNER TO postgres;

--
-- Name: Team_team_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Team_team_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Team_team_id_seq" OWNER TO postgres;

--
-- Name: Team_team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Team_team_id_seq" OWNED BY public."Team".team_id;


--
-- Name: Teammember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Teammember" (
    team_id integer NOT NULL,
    user_id character varying(13) NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    teammember_id integer NOT NULL
);


ALTER TABLE public."Teammember" OWNER TO postgres;

--
-- Name: Teammember_teammember_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Teammember_teammember_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Teammember_teammember_id_seq" OWNER TO postgres;

--
-- Name: Teammember_teammember_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Teammember_teammember_id_seq" OWNED BY public."Teammember".teammember_id;


--
-- Name: Term; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Term" (
    term_id integer NOT NULL,
    "academicYear" integer NOT NULL,
    semester integer NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Term" OWNER TO postgres;

--
-- Name: Term_term_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Term_term_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Term_term_id_seq" OWNER TO postgres;

--
-- Name: Term_term_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Term_term_id_seq" OWNED BY public."Term".term_id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    users_id character varying(100) NOT NULL,
    "passwordHash" character varying(255),
    titles character varying(50),
    firstname character varying(50),
    lastname character varying(50),
    tel_number character varying(10),
    email character varying(100),
    "profilePicture" text,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    "expertiseAreas" text
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Attachment attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment" ALTER COLUMN attachment_id SET DEFAULT nextval('public."Attachment_attachment_id_seq"'::regclass);


--
-- Name: Comment comment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN comment_id SET DEFAULT nextval('public."Comment_comment_id_seq"'::regclass);


--
-- Name: Event event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event" ALTER COLUMN event_id SET DEFAULT nextval('public."Event_event_id_seq"'::regclass);


--
-- Name: Grade grade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade" ALTER COLUMN grade_id SET DEFAULT nextval('public."Grade_grade_id_seq"'::regclass);


--
-- Name: Notification notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN notification_id SET DEFAULT nextval('public."Notification_notification_id_seq"'::regclass);


--
-- Name: OtpCode id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCode" ALTER COLUMN id SET DEFAULT nextval('public."OtpCode_id_seq"'::regclass);


--
-- Name: Project project_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project" ALTER COLUMN project_id SET DEFAULT nextval('public."Project_project_id_seq"'::regclass);


--
-- Name: ProjectAdvisor projectAdvisor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAdvisor" ALTER COLUMN "projectAdvisor_id" SET DEFAULT nextval('public."ProjectAdvisor_projectAdvisor_id_seq"'::regclass);


--
-- Name: Section section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section" ALTER COLUMN section_id SET DEFAULT nextval('public."Section_section_id_seq"'::regclass);


--
-- Name: Section_Enrollment section_enroll_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section_Enrollment" ALTER COLUMN section_enroll_id SET DEFAULT nextval('public."Section_Enrollment_section_enroll_id_seq"'::regclass);


--
-- Name: Submission submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission" ALTER COLUMN submission_id SET DEFAULT nextval('public."Submission_submission_id_seq"'::regclass);


--
-- Name: Task task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task" ALTER COLUMN task_id SET DEFAULT nextval('public."Task_task_id_seq"'::regclass);


--
-- Name: TaskAssignment taskAssignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment" ALTER COLUMN "taskAssignment_id" SET DEFAULT nextval('public."TaskAssignment_taskAssignment_id_seq"'::regclass);


--
-- Name: Team team_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Team" ALTER COLUMN team_id SET DEFAULT nextval('public."Team_team_id_seq"'::regclass);


--
-- Name: Teammember teammember_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teammember" ALTER COLUMN teammember_id SET DEFAULT nextval('public."Teammember_teammember_id_seq"'::regclass);


--
-- Name: Term term_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Term" ALTER COLUMN term_id SET DEFAULT nextval('public."Term_term_id_seq"'::regclass);


--
-- Data for Name: Attachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attachment" ("fileUrl", filename, task_id, "uploadedBy_id", attachment_id) FROM stdin;
/uploads/attachments/043023e6-2e14-4127-ab4c-8c1ca658c1e9_ecommerce-database-diagram-w400.jpeg	ecommerce-database-diagram-w400.jpeg	13	manoch.p	14
/uploads/attachments/6a2e64a9-39c6-4fc5-874f-96742438ca8b_ระบบบริหารจัดการปริญญานิพนธ์.pptx	ระบบบริหารจัดการปริญญานิพนธ์.pptx	12	1166304620386	15
/uploads/attachments/ea7f057d-30a3-4655-9927-2c3bad5b6e92_sitti.png	sitti.png	14	prusayon.n	16
/uploads/attachments/043023e6-2e14-4127-ab4c-8c1ca658c1e9_ecommerce-database-diagram-w400.jpeg	ecommerce-database-diagram-w400.jpeg	16	manoch.p	18
/uploads/attachments/6a2e64a9-39c6-4fc5-874f-96742438ca8b_ระบบบริหารจัดการปริญญานิพนธ์.pptx	ระบบบริหารจัดการปริญญานิพนธ์.pptx	18	1166304620386	19
/uploads/attachments/ea7f057d-30a3-4655-9927-2c3bad5b6e92_sitti.png	sitti.png	19	prusayon.n	20
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (comment_id, text, "createdAt", "isRead", task_id, user_id) FROM stdin;
7	ดำเนินการแล้วค่ะอาจาร์ยตรวจหน่อย	2026-03-11 11:28:07.967	f	12	1166304620386
8	ครับ	2026-03-11 12:05:46.275	f	12	manoch.p
9	test	2026-03-11 12:54:15.57	f	15	1166304620386
10	testsob	2026-03-11 12:54:25.375	f	15	1166304620386
11	test	2026-03-11 12:56:24.925	f	13	1166304620394
12	hi	2026-03-11 12:57:23.163	f	13	1166304620386
13	test	2026-03-11 12:56:24.925	f	16	1166304620394
14	hi	2026-03-11 12:57:23.163	f	16	1166304620386
15	test	2026-03-11 12:54:15.57	f	17	1166304620386
16	testsob	2026-03-11 12:54:25.375	f	17	1166304620386
17	ดำเนินการแล้วค่ะอาจาร์ยตรวจหน่อย	2026-03-11 11:28:07.967	f	18	1166304620386
18	ครับ	2026-03-11 12:05:46.275	f	18	manoch.p
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (event_id, name, description, "dueDate", section_id, "createdAt", "requireFile") FROM stdin;
8	รายงานความคืบหน้าบทที่ 1	\N	2026-03-29 13:02:00	7	2026-03-11 13:02:45.054	t
\.


--
-- Data for Name: Grade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Grade" (grade_id, project_id, term_id, evaluator_id, score, student_id) FROM stdin;
1	12	4	admin	A	1166304620386
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (notification_id, user_id, actor_user_id, title, message, link, "isRead", "createdAt", event_type, team_id, task_id, project_id) FROM stdin;
114	1166304620261	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงาน" กำหนดส่ง 14 มี.ค. 2569	/events	f	2026-03-11 07:13:35.205	EVENT_CREATED	\N	\N	\N
116	manoch.p	\N	มีกิจกรรมใหม่ในหน่วยที่ดูแล	มีกิจกรรมใหม่: "รายงาน" กำหนดส่ง 14 มี.ค. 2569	/advisor-dashboard	t	2026-03-11 07:13:35.213	EVENT_CREATED	\N	\N	\N
118	manoch.p	1166304620386	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี"	/advisorteams	t	2026-03-11 07:28:33.011	ADVISOR_REQUEST	\N	\N	12
121	deachrut.j	1166304620410	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "หำหำหำ"	/advisorteams	f	2026-03-11 07:43:56.865	ADVISOR_REQUEST	\N	\N	\N
119	1166304620386	manoch.p	การร้องขอที่ปรึกษาหลักได้รับการอนุมัติ	คำร้องขอเป็นที่ปรึกษาหลักของโครงงาน "ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี" ได้รับการอนุมัติแล้ว	/projects	t	2026-03-11 07:29:12.223	PROJECT_APPROVED	11	\N	12
112	manoch.p	\N	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "ระบ"	/advisorteams	t	2026-03-11 07:12:22.22	ADVISOR_REQUEST	\N	\N	\N
120	pauline.k	1166304620386	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาร่วมของโครงงาน "ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี"	/advisorteams	t	2026-03-11 07:29:44.72	ADVISOR_REQUEST	\N	\N	12
122	sitti.r	\N	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "ทดสอบ"	/advisorteams	t	2026-03-11 07:48:41.939	ADVISOR_REQUEST	\N	\N	\N
111	sitti.r	1166304620261	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "ระบบบริหารปริญญานิพนธ์"	/advisorteams	t	2026-03-10 22:48:42.73	ADVISOR_REQUEST	\N	\N	\N
127	1166304620394	pauline.k	การร้องขอที่ปรึกษาร่วมถูกปฏิเสธ	คำร้องขอเป็นที่ปรึกษาร่วมของโครงงาน "ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี" ถูกปฏิเสธ	/projects	t	2026-03-11 10:45:30.499	PROJECT_REJECTED	11	\N	12
129	1166304620410	pauline.k	การร้องขอที่ปรึกษาร่วมถูกปฏิเสธ	คำร้องขอเป็นที่ปรึกษาร่วมของโครงงาน "ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี" ถูกปฏิเสธ	/projects	f	2026-03-11 10:45:30.499	PROJECT_REJECTED	11	\N	12
128	1166304620386	pauline.k	การร้องขอที่ปรึกษาร่วมถูกปฏิเสธ	คำร้องขอเป็นที่ปรึกษาร่วมของโครงงาน "ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี" ถูกปฏิเสธ	/projects	t	2026-03-11 10:45:30.499	PROJECT_REJECTED	11	\N	12
130	1166304620410	manoch.p	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	f	2026-03-11 10:50:48.469	TASK_ASSIGNED	11	12	12
133	1166304620410	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	f	2026-03-11 10:50:56.815	TASK_UPDATED	\N	12	12
136	1166304620410	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น TODO	/tasks	f	2026-03-11 10:50:59.799	TASK_UPDATED	\N	12	12
139	1166304620410	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	f	2026-03-11 10:52:45.547	TASK_UPDATED	\N	12	12
142	1166304620410	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น TODO	/tasks	f	2026-03-11 10:52:46.593	TASK_UPDATED	\N	12	12
145	1166304620410	manoch.p	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	f	2026-03-11 10:56:39.769	TASK_ASSIGNED	11	13	12
146	1166304620386	manoch.p	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	t	2026-03-11 10:56:39.774	TASK_ASSIGNED	11	13	12
140	1166304620386	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 10:52:45.552	TASK_UPDATED	\N	12	12
143	1166304620386	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น TODO	/tasks	t	2026-03-11 10:52:46.596	TASK_UPDATED	\N	12	12
137	1166304620386	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น TODO	/tasks	t	2026-03-11 10:50:59.804	TASK_UPDATED	\N	12	12
131	1166304620386	manoch.p	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	t	2026-03-11 10:50:48.474	TASK_ASSIGNED	11	12	12
134	1166304620386	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 10:50:56.819	TASK_UPDATED	\N	12	12
148	1166304620410	1166304620386	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	f	2026-03-11 11:27:12.75	TASK_UPDATED	\N	12	12
144	1166304620394	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น TODO	/tasks	t	2026-03-11 10:52:46.6	TASK_UPDATED	\N	12	12
147	1166304620394	manoch.p	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	t	2026-03-11 10:56:39.777	TASK_ASSIGNED	11	13	12
138	1166304620394	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น TODO	/tasks	t	2026-03-11 10:50:59.81	TASK_UPDATED	\N	12	12
132	1166304620394	manoch.p	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	t	2026-03-11 10:50:48.477	TASK_ASSIGNED	11	12	12
152	1166304620410	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	f	2026-03-11 11:28:07.982	COMMENT_ADDED	11	12	12
154	1166304620410	1166304620386	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_REVIEW	/tasks	f	2026-03-11 11:28:20.553	TASK_UPDATED	\N	12	12
157	1166304620337	1166304620345	เชิญเข้าร่วมทีม	วนัชพร ทองคํา เชิญคุณเข้าร่วมกลุ่มโครงงาน วิชา 66346CPE กดเพื่อยืนยัน/ปฏิเสธ	/Teams	t	2026-03-11 11:43:16.15	TEAM_INVITE	18	\N	\N
158	nachirat.r	1166304620345	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "ระบบจัดการคอร์สนวดและผลิตภัณฑ์สปา"	/advisorteams	t	2026-03-11 11:45:20.125	ADVISOR_REQUEST	\N	\N	19
156	manoch.p	1166304620386	นักศึกษาอัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_REVIEW	\N	t	2026-03-11 11:28:20.56	TASK_UPDATED	\N	12	12
151	manoch.p	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	t	2026-03-11 11:28:07.978	COMMENT_ADDED	11	12	12
150	manoch.p	1166304620386	นักศึกษาอัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	\N	t	2026-03-11 11:27:12.76	TASK_UPDATED	\N	12	12
159	1166304620410	manoch.p	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	f	2026-03-11 12:05:46.29	COMMENT_ADDED	11	12	12
162	1166304620410	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	f	2026-03-11 12:05:51.455	TASK_UPDATED	\N	12	12
165	1166304620410	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_REVIEW	/tasks	f	2026-03-11 12:05:52.548	TASK_UPDATED	\N	12	12
160	1166304620386	manoch.p	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	t	2026-03-11 12:05:46.298	COMMENT_ADDED	11	12	12
163	1166304620386	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 12:05:51.459	TASK_UPDATED	\N	12	12
166	1166304620386	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_REVIEW	/tasks	t	2026-03-11 12:05:52.551	TASK_UPDATED	\N	12	12
168	1166304620410	1166304620386	อัปเดตสถานะงาน	งาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	f	2026-03-11 12:06:32.325	TASK_UPDATED	\N	13	12
167	1166304620394	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_REVIEW	/tasks	t	2026-03-11 12:05:52.555	TASK_UPDATED	\N	12	12
155	1166304620394	1166304620386	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_REVIEW	/tasks	t	2026-03-11 11:28:20.557	TASK_UPDATED	\N	12	12
164	1166304620394	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 12:05:51.463	TASK_UPDATED	\N	12	12
153	1166304620394	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	t	2026-03-11 11:28:07.986	COMMENT_ADDED	11	12	12
169	1166304620394	1166304620386	อัปเดตสถานะงาน	งาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 12:06:32.329	TASK_UPDATED	\N	13	12
161	1166304620394	manoch.p	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)"	/tasks	t	2026-03-11 12:05:46.303	COMMENT_ADDED	11	12	12
149	1166304620394	1166304620386	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 11:27:12.755	TASK_UPDATED	\N	12	12
171	prusayon.n	1166304620360	คำขอเป็นอาจารย์ที่ปรึกษา	มีคำขอให้คุณเป็นที่ปรึกษาหลักของโครงงาน "ทดสอบ"	/advisorteams	t	2026-03-11 12:42:43.065	ADVISOR_REQUEST	\N	\N	20
172	1166304620360	prusayon.n	การร้องขอที่ปรึกษาหลักได้รับการอนุมัติ	คำร้องขอเป็นที่ปรึกษาหลักของโครงงาน "ทดสอบ" ได้รับการอนุมัติแล้ว	/projects	t	2026-03-11 12:43:42.965	PROJECT_APPROVED	19	\N	20
173	1166304620329	1166304620360	เชิญเข้าร่วมทีม	ณัฐชัย ยิ้มฉาย เชิญคุณเข้าร่วมกลุ่มโครงงาน วิชา 66346CPE กดเพื่อยืนยัน/ปฏิเสธ	/Teams	f	2026-03-11 12:45:04.367	TEAM_INVITE	19	\N	\N
174	1166304620361	1166304620360	เชิญเข้าร่วมทีม	ณัฐชัย ยิ้มฉาย เชิญคุณเข้าร่วมกลุ่มโครงงาน วิชา 66346CPE กดเพื่อยืนยัน/ปฏิเสธ	/Teams	f	2026-03-11 12:46:20.017	TEAM_INVITE	19	\N	\N
176	1166304620360	prusayon.n	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "หาrequiement"	/tasks	t	2026-03-11 12:51:09.434	TASK_ASSIGNED	19	14	20
177	prusayon.n	1166304620360	นักศึกษาอัปเดตสถานะงาน	งาน "หาrequiement" เปลี่ยนสถานะเป็น IN_PROGRESS	\N	f	2026-03-11 12:51:27.421	TASK_UPDATED	\N	14	20
178	1166304620410	1166304620386	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "ทดสอบ"	/tasks	f	2026-03-11 12:53:42.07	TASK_ASSIGNED	11	15	12
182	1166304620394	1166304620386	อัปเดตสถานะงาน	งาน "ทดสอบ" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 12:54:37.738	TASK_UPDATED	\N	15	12
181	1166304620394	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ทดสอบ"	/tasks	t	2026-03-11 12:54:25.385	COMMENT_ADDED	11	15	12
179	1166304620394	1166304620386	ได้รับมอบหมายงานใหม่	คุณถูก assign ให้งาน "ทดสอบ"	/tasks	t	2026-03-11 12:53:42.075	TASK_ASSIGNED	11	15	12
180	1166304620394	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ทดสอบ"	/tasks	t	2026-03-11 12:54:15.581	COMMENT_ADDED	11	15	12
135	1166304620394	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 10:50:56.823	TASK_UPDATED	\N	12	12
141	1166304620394	manoch.p	อัปเดตสถานะงาน	งาน "สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)" เปลี่ยนสถานะเป็น IN_PROGRESS	/tasks	t	2026-03-11 10:52:45.556	TASK_UPDATED	\N	12	12
186	1166304620410	1166304620394	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	f	2026-03-11 12:56:24.937	COMMENT_ADDED	11	13	12
187	1166304620386	1166304620394	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	t	2026-03-11 12:56:24.94	COMMENT_ADDED	11	13	12
189	1166304620410	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	f	2026-03-11 12:57:23.178	COMMENT_ADDED	11	13	12
190	1166304620394	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	t	2026-03-11 12:57:23.181	COMMENT_ADDED	11	13	12
191	1166304620386	admin	ได้รับเกรดใหม่	คุณได้รับเกรดแล้ว กรุณาตรวจสอบที่ Dashboard	/dashboard	t	2026-03-11 12:59:47.724	GRADE_GIVEN	\N	\N	\N
188	manoch.p	1166304620386	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	t	2026-03-11 12:57:23.174	COMMENT_ADDED	11	13	12
170	manoch.p	1166304620386	นักศึกษาอัปเดตสถานะงาน	งาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)" เปลี่ยนสถานะเป็น IN_PROGRESS	\N	t	2026-03-11 12:06:32.334	TASK_UPDATED	\N	13	12
183	manoch.p	1166304620386	นักศึกษาอัปเดตสถานะงาน	งาน "ทดสอบ" เปลี่ยนสถานะเป็น IN_PROGRESS	\N	t	2026-03-11 12:54:37.742	TASK_UPDATED	\N	15	12
184	manoch.p	1166304620394	นักศึกษาอัปเดตสถานะงาน	งาน "ทดสอบ" เปลี่ยนสถานะเป็น DONE	\N	t	2026-03-11 12:55:41.689	TASK_UPDATED	\N	15	12
185	manoch.p	1166304620394	มีความคิดเห็นใหม่	มี comment ใหม่ในงาน "ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)"	/tasks	t	2026-03-11 12:56:24.932	COMMENT_ADDED	11	13	12
194	1166304620410	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/events	f	2026-03-11 13:02:45.081	EVENT_CREATED	\N	\N	\N
195	1166304620345	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/events	f	2026-03-11 13:02:45.083	EVENT_CREATED	\N	\N	\N
193	1166304620394	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/events	t	2026-03-11 13:02:45.078	EVENT_CREATED	\N	\N	\N
196	1166304620337	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/events	f	2026-03-11 13:02:45.086	EVENT_CREATED	\N	\N	\N
197	1166304620360	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/events	f	2026-03-11 13:02:45.09	EVENT_CREATED	\N	\N	\N
199	prusayon.n	\N	มีกิจกรรมใหม่ในหน่วยที่ดูแล	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/advisor-dashboard	f	2026-03-11 13:02:45.097	EVENT_CREATED	\N	\N	\N
192	1166304620386	\N	มีกิจกรรมใหม่	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/events	t	2026-03-11 13:02:45.075	EVENT_CREATED	\N	\N	\N
198	manoch.p	\N	มีกิจกรรมใหม่ในหน่วยที่ดูแล	มีกิจกรรมใหม่: "รายงานความคืบหน้าบทที่ 1" กำหนดส่ง 29 มี.ค. 2569	/advisor-dashboard	t	2026-03-11 13:02:45.095	EVENT_CREATED	\N	\N	\N
200	manoch.p	1166304620386	มีการส่งงานใหม่	กลุ่ม C07 ส่งงาน "รายงานความคืบหน้าบทที่ 1"	/events	t	2026-03-11 13:03:16.183	SUBMISSION_SUBMITTED	11	\N	12
201	1166304620410	admin	งานได้รับการอนุมัติ	งาน "รายงานความคืบหน้าบทที่ 1" ได้รับการอนุมัติแล้ว	/events	f	2026-03-11 13:04:00.327	SUBMISSION_APPROVED	11	\N	\N
202	1166304620386	admin	งานได้รับการอนุมัติ	งาน "รายงานความคืบหน้าบทที่ 1" ได้รับการอนุมัติแล้ว	/events	f	2026-03-11 13:04:00.327	SUBMISSION_APPROVED	11	\N	\N
203	1166304620394	admin	งานได้รับการอนุมัติ	งาน "รายงานความคืบหน้าบทที่ 1" ได้รับการอนุมัติแล้ว	/events	t	2026-03-11 13:04:00.327	SUBMISSION_APPROVED	11	\N	\N
\.


--
-- Data for Name: OtpCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OtpCode" (id, email, otp, "expiresAt", "isUsed", "failCount", "createdAt") FROM stdin;
14	1166304620261@mail.rmutt.ac.th	466282	2026-03-10 22:46:53.612	t	0	2026-03-10 22:41:53.612
17	test123@mail.rmutt.ac.th	514524	2026-03-11 06:37:10.493	f	0	2026-03-11 06:32:10.494
18	asdasdad@en.rmutt.ac.th	998373	2026-03-11 06:46:39.072	f	0	2026-03-11 06:41:39.073
19	1166304620394@mail.rmutt.ac.th	493315	2026-03-11 06:48:32.432	t	0	2026-03-11 06:43:32.433
20	1166304620394@mail.rmutt.ac.th	620149	2026-03-11 06:50:29.555	t	1	2026-03-11 06:45:29.556
21	1166304620394@mail.rmutt.ac.th	186385	2026-03-11 06:52:49.602	f	0	2026-03-11 06:47:49.603
22	1166304620360@mail.rmutt.ac.th	748418	2026-03-11 06:55:43.347	t	1	2026-03-11 06:50:43.348
23	1166304620410@mail.rmutt.ac.th	202759	2026-03-11 06:57:42.423	t	0	2026-03-11 06:52:42.424
27	1166304620386@mail.rmutt.ac.th	163626	2026-03-11 07:30:28.356	t	0	2026-03-11 07:25:28.357
28	1166304620261@mail.rmutt.ac.th	598985	2026-03-11 07:53:51.446	t	0	2026-03-11 07:48:51.447
29	1166304620410@mail.rmutt.ac.th	898858	2026-03-11 08:18:11.131	t	0	2026-03-11 08:13:11.132
30	1166304620360@mail.rmutt.ac.th	406528	2026-03-11 10:26:11.936	t	0	2026-03-11 10:21:11.937
32	1166304620345@mail.rmutt.ac.th	138450	2026-03-11 11:45:06.272	t	0	2026-03-11 11:40:06.274
31	1166304620337@mail.rmutt.ac.th	362548	2026-03-11 11:45:01.599	t	0	2026-03-11 11:40:01.6
33	1166304620329@mail.rmutt.ac.th	933141	2026-03-11 12:00:53.876	t	0	2026-03-11 11:55:53.877
34	1166304620329@mail.rmutt.ac.th	609137	2026-03-11 12:06:59.974	t	0	2026-03-11 12:01:59.975
35	1166304620369@mail.rmutt.ac.th	143094	2026-03-11 13:25:39.327	t	0	2026-03-11 13:20:39.328
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (project_id, projectname, description, team_id, "createdAt", project_type, "projectnameEng", "isArchived", status) FROM stdin;
21	ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี	มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรีเป็นมหาวิทยาลัยที่มีพื้นที่ขนาดใหญ่และมีอาคารเรียนจำนวนมาก ส่งผลให้นักศึกษา บุคลากร และผู้มาติดต่อจากภายนอกประสบปัญหาในการค้นหาอาคารหรือห้องเรียนภายในมหาวิทยาลัย โดยเฉพาะนักศึกษาใหม่ที่ยังไม่คุ้นเคยกับพื้นที่ ซึ่งอาจทำให้เกิดความล่าช้าและความสับสนในการเดินทาง\nโครงงานนี้มีวัตถุประสงค์เพื่อพัฒนา ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี ในรูปแบบโมบายแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ โดยระบบประกอบด้วยสองส่วนหลัก ได้แก่ โมบายแอปพลิเคชันสำหรับผู้ใช้งาน และเว็บแอปพลิเคชันสำหรับผู้ดูแลระบบ เพื่อใช้ในการจัดการข้อมูลอาคาร ห้องเรียน และสถานที่ต่าง ๆ ภายในมหาวิทยาลัย\nแอปพลิเคชันรองรับระบบปฏิบัติการ Android โดยผู้ใช้งานสามารถค้นหาอาคาร ห้องเรียน หรือหน่วยงานต่าง ๆ พร้อมแสดงข้อมูลสถานที่และนำทางผ่าน Google Maps รวมถึงสามารถแสดงตำแหน่งปัจจุบันของผู้ใช้งานและบันทึกสถานที่ที่ใช้งานบ่อยได้\nผลการพัฒนาพบว่า ระบบสามารถช่วยให้ผู้ใช้งานค้นหาอาคารและห้องเรียนภายในมหาวิทยาลัยได้สะดวกและรวดเร็ว ลดความสับสนในการเดินทาง และเพิ่มประสิทธิภาพในการเข้าถึงข้อมูลสถานที่ภายในมหาวิทยาลัยได้อย่างมีประสิทธิภาพ\nคำสำคัญ: ระบบแนะนำเส้นทาง, โมบายแอปพลิเคชัน, การค้นหาห้องเรียน, มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี\n	20	2026-03-11 13:15:33.358	Mobile Application	Smart Navigation App for Rajamangala University of Technology Thanyaburi	f	APPROVED
22	ทดสอบ	test	21	2026-03-11 13:15:33.382	Web Application	test	f	APPROVED
20	ทดสอบ	test	19	2026-03-11 12:42:23.071	Web Application	test	t	APPROVED
19	ระบบจัดการคอร์สนวดและผลิตภัณฑ์สปา	\N	18	2026-03-11 11:45:09.741	Web Application	Massage course and spa product management system	t	PENDING
12	ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี	มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรีเป็นมหาวิทยาลัยที่มีพื้นที่ขนาดใหญ่และมีอาคารเรียนจำนวนมาก ส่งผลให้นักศึกษา บุคลากร และผู้มาติดต่อจากภายนอกประสบปัญหาในการค้นหาอาคารหรือห้องเรียนภายในมหาวิทยาลัย โดยเฉพาะนักศึกษาใหม่ที่ยังไม่คุ้นเคยกับพื้นที่ ซึ่งอาจทำให้เกิดความล่าช้าและความสับสนในการเดินทาง\nโครงงานนี้มีวัตถุประสงค์เพื่อพัฒนา ระบบแอปพลิเคชันแนะนำเส้นทางและค้นหาห้องเรียนภายในมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี ในรูปแบบโมบายแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ โดยระบบประกอบด้วยสองส่วนหลัก ได้แก่ โมบายแอปพลิเคชันสำหรับผู้ใช้งาน และเว็บแอปพลิเคชันสำหรับผู้ดูแลระบบ เพื่อใช้ในการจัดการข้อมูลอาคาร ห้องเรียน และสถานที่ต่าง ๆ ภายในมหาวิทยาลัย\nแอปพลิเคชันรองรับระบบปฏิบัติการ Android โดยผู้ใช้งานสามารถค้นหาอาคาร ห้องเรียน หรือหน่วยงานต่าง ๆ พร้อมแสดงข้อมูลสถานที่และนำทางผ่าน Google Maps รวมถึงสามารถแสดงตำแหน่งปัจจุบันของผู้ใช้งานและบันทึกสถานที่ที่ใช้งานบ่อยได้\nผลการพัฒนาพบว่า ระบบสามารถช่วยให้ผู้ใช้งานค้นหาอาคารและห้องเรียนภายในมหาวิทยาลัยได้สะดวกและรวดเร็ว ลดความสับสนในการเดินทาง และเพิ่มประสิทธิภาพในการเข้าถึงข้อมูลสถานที่ภายในมหาวิทยาลัยได้อย่างมีประสิทธิภาพ\nคำสำคัญ: ระบบแนะนำเส้นทาง, โมบายแอปพลิเคชัน, การค้นหาห้องเรียน, มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี\n	11	2026-03-11 07:28:19.692	Mobile Application	Smart Navigation App for Rajamangala University of Technology Thanyaburi	t	APPROVED
\.


--
-- Data for Name: ProjectAdvisor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectAdvisor" (project_id, advisor_id, "projectAdvisor_id", advisor_role, status) FROM stdin;
12	manoch.p	16	PRIMARY	APPROVED
19	nachirat.r	20	PRIMARY	PENDING
20	prusayon.n	21	PRIMARY	APPROVED
21	manoch.p	22	PRIMARY	APPROVED
22	prusayon.n	23	PRIMARY	APPROVED
\.


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Section" (section_id, section_code, course_type, study_type, min_team_size, max_team_size, term_id, team_locked) FROM stdin;
7	66346CPE	PRE_PROJECT	LE	1	3	4	f
8	66346CPE	PROJECT	LE	1	3	5	f
\.


--
-- Data for Name: Section_Enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Section_Enrollment" (section_enroll_id, section_id, users_id, "enrolledAt") FROM stdin;
9	7	1166304620261	2026-03-10 22:47:33.773
11	7	1166304620394	2026-03-11 06:54:24.242
12	7	1166304620410	2026-03-11 07:24:39.118
13	7	1166304620386	2026-03-11 07:26:41.426
14	7	1166304620360	2026-03-11 10:24:25.044
15	7	1166304620345	2026-03-11 11:41:54.689
16	7	1166304620337	2026-03-11 11:42:09.057
17	7	1166304620329	2026-03-11 12:38:11.145
18	7	1166304620361	2026-03-11 12:40:53.937
19	8	1166304620394	2026-03-11 13:15:33.351
20	8	1166304620410	2026-03-11 13:15:33.351
21	8	1166304620386	2026-03-11 13:15:33.351
22	8	1166304620360	2026-03-11 13:15:33.351
\.


--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Submission" (submission_id, event_id, team_id, status, "submittedAt", file, feedback, "approvedAt", "approvedBy", "createdAt") FROM stdin;
9	8	18	PENDING	\N	\N	\N	\N	\N	2026-03-11 13:02:45.061
10	8	19	PENDING	\N	\N	\N	\N	\N	2026-03-11 13:02:45.061
8	8	11	APPROVED	2026-03-11 13:03:16.169	/uploads/submissions/9ea3cd3c-834d-45ad-ae97-7b630d885d30_CP-ALL_Signed-FS-TH-YE23.pdf	\N	2026-03-11 13:04:00.315	admin	2026-03-11 13:02:45.061
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" (task_id, title, description, status, priority, tags, "startDate", "dueDate", "authorUserId", project_id, "position") FROM stdin;
13	ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)	ให้นำ Requirement มาวิเคราะห์ว่าต้องเก็บข้อมูลอะไรบ้าง สร้างตาราง (Entity) กำหนดฟิลด์ (Attribute) และลากเส้นความสัมพันธ์ (Relationship) ให้ครบถ้วน ก่อนนำมาพรีเซนต์ให้อาจารย์ตรวจ	IN_PROGRESS	MEDIUM	\N	2026-04-12 00:00:00	2026-06-21 00:00:00	manoch.p	12	0
14	หาrequiement	รายะลเอียด	IN_PROGRESS	HIGH	\N	2026-03-13 00:00:00	2026-03-23 00:00:00	prusayon.n	20	0
15	ทดสอบ	test	DONE	MEDIUM	\N	2026-03-10 00:00:00	2026-03-21 00:00:00	1166304620386	12	0
12	สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)	ให้นักศึกษาไปรวบรวมข้อมูลว่าระบบเว็บไซต์นี้ต้องมีฟีเจอร์อะไรบ้าง ใครคือผู้ใช้งานหลัก และสรุปขอบเขตมาให้อาจารย์ดู เพื่อไม่ให้โปรเจคบานปลาย	IN_REVIEW	HIGH	Requirement, Planning	2026-03-13 00:00:00	2026-03-31 00:00:00	manoch.p	12	0
16	ออกแบบแผนภาพฐานข้อมูล (ERD - Entity Relationship Diagram)	ให้นำ Requirement มาวิเคราะห์ว่าต้องเก็บข้อมูลอะไรบ้าง สร้างตาราง (Entity) กำหนดฟิลด์ (Attribute) และลากเส้นความสัมพันธ์ (Relationship) ให้ครบถ้วน ก่อนนำมาพรีเซนต์ให้อาจารย์ตรวจ	IN_PROGRESS	MEDIUM	\N	2026-04-12 00:00:00	2026-06-21 00:00:00	manoch.p	21	0
17	ทดสอบ	test	DONE	MEDIUM	\N	2026-03-10 00:00:00	2026-03-21 00:00:00	1166304620386	21	0
18	สรุป Requirement และกำหนดขอบเขตโปรเจค (Project Scope)	ให้นักศึกษาไปรวบรวมข้อมูลว่าระบบเว็บไซต์นี้ต้องมีฟีเจอร์อะไรบ้าง ใครคือผู้ใช้งานหลัก และสรุปขอบเขตมาให้อาจารย์ดู เพื่อไม่ให้โปรเจคบานปลาย	IN_REVIEW	HIGH	Requirement, Planning	2026-03-13 00:00:00	2026-03-31 00:00:00	manoch.p	21	0
19	หาrequiement	รายะลเอียด	IN_PROGRESS	HIGH	\N	2026-03-13 00:00:00	2026-03-23 00:00:00	prusayon.n	22	0
\.


--
-- Data for Name: TaskAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskAssignment" (user_id, task_id, "taskAssignment_id") FROM stdin;
1166304620410	12	12
1166304620386	12	13
1166304620394	12	14
1166304620410	13	15
1166304620386	13	16
1166304620394	13	17
1166304620360	14	18
1166304620394	15	20
1166304620410	16	21
1166304620386	16	22
1166304620394	16	23
1166304620394	17	24
1166304620410	18	25
1166304620386	18	26
1166304620394	18	27
1166304620360	19	28
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Team" (team_id, section_id, "createdAt", "groupNumber") FROM stdin;
11	7	2026-03-11 07:26:54.332	C07
18	7	2026-03-11 11:42:58.141	TEMP-1773229378140
19	7	2026-03-11 12:41:57.948	TEMP-1773232917947
20	8	2026-03-11 13:15:33.353	C07
21	8	2026-03-11 13:15:33.379	TEMP-1773232917947
\.


--
-- Data for Name: Teammember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Teammember" (team_id, user_id, "joinedAt", teammember_id) FROM stdin;
11	1166304620386	2026-03-11 07:26:54.338	13
11	1166304620394	2026-03-11 10:42:55.588	23
11	1166304620410	2026-03-11 10:42:57.547	24
18	1166304620345	2026-03-11 11:42:58.147	25
18	1166304620337	2026-03-11 11:44:34.328	26
19	1166304620360	2026-03-11 12:41:57.954	27
20	1166304620386	2026-03-11 13:15:33.356	28
20	1166304620394	2026-03-11 13:15:33.356	29
20	1166304620410	2026-03-11 13:15:33.356	30
21	1166304620360	2026-03-11 13:15:33.381	31
\.


--
-- Data for Name: Term; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Term" (term_id, "academicYear", semester, "endDate", "startDate") FROM stdin;
4	2569	1	2026-06-26 00:00:00	2026-03-01 00:00:00
5	2569	2	2026-03-31 00:00:00	2026-03-02 00:00:00
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (users_id, "passwordHash", titles, firstname, lastname, tel_number, email, "profilePicture", role, "expertiseAreas") FROM stdin;
deachrut.j	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์	เดชรัชต์	ใจถวิล	025493461	deachrut.j@en.rmutt.ac.th	/uploads/profiles/66ebc621-0c07-4627-b6d4-0e287d036a3a_Deachrut.png	ADVISOR	Design Thinking, Server Programming, Computer Programming
jedsada.a	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์	เจษฎา	อรุณฤกษ์	025493467	jedsada.a@en.rmutt.ac.th	/uploads/profiles/a0746354-b254-4471-9010-f491a1cd4a5d_Jedsada.png	ADVISOR	Computer Programming, Computer Architecture and Organization, Computer Hardware Laboratory, Computer and Information Technology Skills
manoch.p	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	อาจารย์	มาโนช	ประชา	025493464	manoch.p@en.rmutt.ac.th	/uploads/profiles/50429020-a2fb-41b9-91d4-65bd1ca1fdb3_Manoch.png	ADVISOR	Computer Programming, Theory of Computation, Computer and Information Technology Skills
nachirat.r	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	รองศาสตราจารย์	นชิรัตน์	ราชบุรี	025493467	nachirat.r@en.rmutt.ac.th	/uploads/profiles/6d9bafd7-3dc5-4ae7-9e62-d69c485e7a1d_Nachirat.png	ADVISOR	Computer Programming, Data Structure and Algorithms, Mobile Device Programming for Digital Industry, Data Mining
nuchtiphong.o	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์	ณัชติพงศ์	อูทอง	025493464	nuchtiphong.o@en.rmutt.ac.th	/uploads/profiles/8313ca0d-4b63-40be-a7e1-508691aafa0a_Nuchtiphong.png	ADVISOR	Advanced Digital System Design, Computer Programming
patrapee.s	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์	พัฒณ์รพี	สุนันทพจน์	025493466	patrapee.s@en.mutt.ac.th	/uploads/profiles/855d0aa6-3260-436a-a7bc-5cc728d0319c_Patrapee.png	ADVISOR	Computer and Information Technology Skills, Advanced Computer Programming, Database Systems
prusayon.n	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	รองศาสตราจารย์ ดร.	พฤศยน	นินทนาวงศา	025493467	prusayon.n@en.rmutt.ac.th	/uploads/profiles/98e02a02-0943-4a3e-a59f-f17f0671d422_Prusayon.png	ADVISOR	Computer Networks, Data Communications, Computer Programming, Operating Systems, Research Methodology in Electrical Engineering, Wireless Networking, Local Area Networks and Internetworking
samatachai.j	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์	สมรรถชัย	จันทรัตน์	025493467	samatachai.j@en.rmutt.ac.th	/uploads/profiles/624eacba-9ca4-4985-8145-e92f493619c9_Samatachai.png	ADVISOR	Computer Programming, Digital Circuit and Logic Design, Computer Engineering Laboratory, IC3
admin	$2b$10$cCa8s5m/IeyN8Da2vxGVF.ifxCVW/gNCXbhwZqoDH19BEPsy/Yr42	\N	ผู้ดูแล	ระบบ	\N	admin@cpe.rmutt.ac.th	\N	ADMIN	\N
sirichai.t	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์ ดร.	ศิริชัย	เตรียมล้ำเลิศ	025493461	sirichai.t@en.rmutt.ac.th	/uploads/profiles/0aa16074-b5c6-41d0-8978-6c53c3884d22_Sirichai.png	ADVISOR	Object-Oriented Programming, Computer Programming, Computer Information and Technology Skills, English for Engineering
sitti.r	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	อาจารย์	สิทธิ	รักถนอม	025493467	sitti.r@en.rmutt.ac.th	/uploads/profiles/5d0c3051-6054-4438-b8ab-685777399441_sitti.png	ADVISOR	Computer Programming, CPE Pre-Project, Mobile Device Programming for Digital Industry
thanasin.b	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์ ดร.	ธนสิน	บุญนาม	025493467	thanasin.b@en.rmutt.ac.th	/uploads/profiles/ca3ae571-1f2c-428f-b1e0-eeb8d9c1d8b5_Thanasin.png	ADVISOR	Electronics for Computer Engineering, Microcontroller and Interfacing, Internet of Things, Image Processing, Computer Programming
weerachai.y	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	อาจารย์	วีระชัย	แย้มวจี	025493466	weerachai.y@en.rmutt.ac.th	/uploads/profiles/47a87d10-594c-44a4-8668-f50e0c01b415_Weerachai.png	ADVISOR	Computer Network Laboratory, TCP/IP Networks, Computer Security, Computer Engineering Project, Computer Programming, Computer and Information Technology Skills
1166304620410	$2b$10$Hx2w57BySq3pec/ui/Hkr.Qrk8oMyy1nOD39g5GOE.YJ7ZKccxQ5i		ณัฐพงศ์	ทองคำ	0000000000	1166304620410@mail.rmutt.ac.th	/uploads/profiles/075ed702-1720-476e-ba57-42d81bb462a5_641664836_1396156622315342_2412365168848776578_n.jpg	STUDENT	\N
pauline.k	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์ ดร.	ปอลิน	กองสุวรรณ	025493464	pauline.k@en.rmutt.ac.th	/uploads/profiles/f664f0ef-f9f8-4952-8c8f-4924477cc487_ปอลิน.png	ADVISOR	Computer Programming, Computer and Information Technology Skills, Software Engineering, Preparation for Professional Experience, Cooperative Education, Apprenticeship
pachara.s	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ดร.	พชร	ศรีมุกข์	025493467	pachara.s@en.rmutt.ac.th	/uploads/profiles/c8181277-cf0c-4c1b-bf9c-df25832680c6_1N7A3970-scaled-e1735010293428.jpg	ADVISOR	Computer Programming, Embedded Systems, Operating Systems
anuruk.p	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ดร.	อนุรักษ์	พรหมโคตร	025493464	anuruk.p@en.rmutt.ac.th	/uploads/profiles/82b8a201-8ed6-4521-8bb6-4c24c7cae4bc_229446.jpg	ADVISOR	Computer Programming
pitchayapatchaya.s	$2b$10$C515y7baS.ehdQfNDJ2tiOK0ikU32gQg8tI3apjhKUJE2RrR6p0eC	ผู้ช่วยศาสตราจารย์ ดร.	พิชยพัชยา	ศรีคร้าม	025493464	pitchayapatchaya.S@en.rmutt.ac.th	/uploads/profiles/477d6052-8346-4922-b3db-f80379b76036_Pitchayapatchaya.png	ADVISOR	Computer Programming, Image Processing
1166304620361	$2b$10$ksjGAu4CblLy44EZZFRstOS4rDfjbNLONmYYs8rbMhGYNKbKXUPNC		ทดสอบ	ทดสอบ		1166304620361@mail.rmutt.ac.tj	\N	STUDENT	\N
1166304620394	$2b$10$KvKCs1k0p4gtXSfD0yEs8O0yA61/Uxr12mYkvXhVnsDP1Y8a.bEZ.	นาย	สิทธิกร	บุญณะ	0873827387	1166304620394@mail.rmutt.ac.th	/uploads/profiles/8f85602d-2d44-420c-98aa-caf30d64ce55_test.webp	STUDENT	\N
1166304620386	$2b$10$U4dp55EmcuYxfSebkDXA2uXogAq1oGtDpPcfM0I7VqYosdeEvd2pm		พอเพียง	พันธุ์พุก	0929610484	1166304620386@mail.rmutt.ac.th	/uploads/profiles/4cb4712f-1e1b-4dad-87cf-c5fbfd4c9a4b_เซน.jpg	STUDENT	\N
1166304620345	$2b$10$EuUYM4mKQiBj/lQVwrTxhOwt8/4KKcI56rxzAozNlDL61hkiqZbXO	นางสาว	วนัชพร	ทองคํา	0918716674	1166304620345@mail.rmutt.ac.th	\N	STUDENT	\N
1166304620337	$2b$10$1Cp89L6eX34YHCMB7D8Rtuy3XUvNpNhFaIg7m1eY7DciixAyAM2Z6	นาย	ธนดล	จำปาเต็ม	0123457986	1166304620337@mail.rmutt.ac.th	\N	STUDENT	\N
1166304620329	$2b$10$Vmd/1gHya4VQeqcp1L/cCOl8uely/apXqDHS5b.TThnBKH/ymeHPO	นาย	จิระเดช	คุ้มศิริ	0968822402	1166304620329@mail.rmutt.ac.th	\N	STUDENT	\N
1166304620261	$2b$10$hUe6r8ZDMY33V8A5jJv/Q.pBM8Z6qMBKFAQYhX9YZg9jJv8vum6XS	นาย	วาณิช	ชาวเวียง	0888888888	1166304620261@mail.rmutt.ac.th	/uploads/profiles/c4b3e20a-758e-452c-b5c4-74fb51409176_image.jpg	STUDENT	\N
1166304620360	$2b$10$D3X1bustDf5YBWnt4T1wgeoCpCTiQm/x3ra/86a.Z/GblpteSq4qu	นาย	ณัฐชัย	ยิ้มฉาย	0834311911	1166304620360@mail.rmutt.ac.th	/uploads/profiles/55d04a21-09e1-4a48-8ab4-e4f5727bbf8a_IMG_8349.PNG.png	STUDENT	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c9326131-abd1-4f7e-83e5-ff7a92011791	9999cbbd39972760761b552e334da88f1520e38a935d25a27e934fc4bb99dad3	2026-03-10 15:47:39.727547+00	20260309054013_initial_state	\N	\N	2026-03-10 15:47:39.484891+00	1
7a46f678-5346-4e5d-afba-24f584a1e8bf	150a15323c290acfa6757e4933fa9655abf75eca6cb5058f8a087fb1df701017	2026-03-10 15:47:39.742375+00	20260309194855_add_co_advisor	\N	\N	2026-03-10 15:47:39.730384+00	1
7ebfe84d-1454-4001-9db5-e01a506445ff	8f2476d0939993ffab71d79895533352836a5e401f6b65c6037dd8e176816409	2026-03-10 16:46:39.293976+00	20260310164639_remove_team_status	\N	\N	2026-03-10 16:46:39.276945+00	1
624a70b9-d042-4f34-95c9-525cdfb86bd7	6cc4e78e122a5ccda4a33291ab07541842fbb152298d4f96214b8dbb85f55fa7	2026-03-10 16:56:09.559953+00	20260310165609_remove_topic_thai	\N	\N	2026-03-10 16:56:09.55265+00	1
1966e2e8-acb2-4989-b868-6a937d4681b6	c961efa1ef751ab4cbceec02e860148b7a659de53b87d3159bb09effe11faa17	2026-03-10 17:07:56.544343+00	20260310170756_remove_redundant_team_fields	\N	\N	2026-03-10 17:07:56.536585+00	1
\.


--
-- Name: Attachment_attachment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Attachment_attachment_id_seq"', 20, true);


--
-- Name: Comment_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Comment_comment_id_seq"', 18, true);


--
-- Name: Event_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Event_event_id_seq"', 8, true);


--
-- Name: Grade_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Grade_grade_id_seq"', 1, true);


--
-- Name: Notification_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notification_notification_id_seq"', 203, true);


--
-- Name: OtpCode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OtpCode_id_seq"', 35, true);


--
-- Name: ProjectAdvisor_projectAdvisor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProjectAdvisor_projectAdvisor_id_seq"', 23, true);


--
-- Name: Project_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Project_project_id_seq"', 22, true);


--
-- Name: Section_Enrollment_section_enroll_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Section_Enrollment_section_enroll_id_seq"', 22, true);


--
-- Name: Section_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Section_section_id_seq"', 8, true);


--
-- Name: Submission_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Submission_submission_id_seq"', 10, true);


--
-- Name: TaskAssignment_taskAssignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TaskAssignment_taskAssignment_id_seq"', 28, true);


--
-- Name: Task_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Task_task_id_seq"', 19, true);


--
-- Name: Team_team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Team_team_id_seq"', 21, true);


--
-- Name: Teammember_teammember_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Teammember_teammember_id_seq"', 31, true);


--
-- Name: Term_term_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Term_term_id_seq"', 5, true);


--
-- Name: Attachment Attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_pkey" PRIMARY KEY (attachment_id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (comment_id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (event_id);


--
-- Name: Grade Grade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_pkey" PRIMARY KEY (grade_id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (notification_id);


--
-- Name: OtpCode OtpCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCode"
    ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY (id);


--
-- Name: ProjectAdvisor ProjectAdvisor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAdvisor"
    ADD CONSTRAINT "ProjectAdvisor_pkey" PRIMARY KEY ("projectAdvisor_id");


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (project_id);


--
-- Name: Section_Enrollment Section_Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section_Enrollment"
    ADD CONSTRAINT "Section_Enrollment_pkey" PRIMARY KEY (section_enroll_id);


--
-- Name: Section Section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_pkey" PRIMARY KEY (section_id);


--
-- Name: Submission Submission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_pkey" PRIMARY KEY (submission_id);


--
-- Name: TaskAssignment TaskAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskAssignment_id");


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (task_id);


--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (team_id);


--
-- Name: Teammember Teammember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teammember"
    ADD CONSTRAINT "Teammember_pkey" PRIMARY KEY (teammember_id);


--
-- Name: Term Term_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Term"
    ADD CONSTRAINT "Term_pkey" PRIMARY KEY (term_id);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (users_id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: OtpCode_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OtpCode_email_idx" ON public."OtpCode" USING btree (email);


--
-- Name: ProjectAdvisor_project_id_advisor_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProjectAdvisor_project_id_advisor_id_key" ON public."ProjectAdvisor" USING btree (project_id, advisor_id);


--
-- Name: Project_team_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Project_team_id_key" ON public."Project" USING btree (team_id);


--
-- Name: Section_Enrollment_section_id_users_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Section_Enrollment_section_id_users_id_key" ON public."Section_Enrollment" USING btree (section_id, users_id);


--
-- Name: Section_section_code_term_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Section_section_code_term_id_key" ON public."Section" USING btree (section_code, term_id);


--
-- Name: Submission_event_id_team_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Submission_event_id_team_id_key" ON public."Submission" USING btree (event_id, team_id);


--
-- Name: TaskAssignment_task_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TaskAssignment_task_id_user_id_key" ON public."TaskAssignment" USING btree (task_id, user_id);


--
-- Name: Team_groupNumber_section_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Team_groupNumber_section_id_key" ON public."Team" USING btree ("groupNumber", section_id);


--
-- Name: Teammember_user_id_team_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Teammember_user_id_team_id_key" ON public."Teammember" USING btree (user_id, team_id);


--
-- Name: Users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Users_email_key" ON public."Users" USING btree (email);


--
-- Name: Attachment Attachment_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public."Task"(task_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attachment Attachment_uploadedBy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_uploadedBy_id_fkey" FOREIGN KEY ("uploadedBy_id") REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public."Task"(task_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public."Section"(section_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_evaluator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_evaluator_id_fkey" FOREIGN KEY (evaluator_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(project_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_term_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_term_id_fkey" FOREIGN KEY (term_id) REFERENCES public."Term"(term_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_actor_user_id_fkey" FOREIGN KEY (actor_user_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(project_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public."Task"(task_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public."Team"(team_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAdvisor ProjectAdvisor_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAdvisor"
    ADD CONSTRAINT "ProjectAdvisor_advisor_id_fkey" FOREIGN KEY (advisor_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAdvisor ProjectAdvisor_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectAdvisor"
    ADD CONSTRAINT "ProjectAdvisor_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(project_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public."Team"(team_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Section_Enrollment Section_Enrollment_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section_Enrollment"
    ADD CONSTRAINT "Section_Enrollment_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public."Section"(section_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Section_Enrollment Section_Enrollment_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section_Enrollment"
    ADD CONSTRAINT "Section_Enrollment_users_id_fkey" FOREIGN KEY (users_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Section Section_term_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_term_id_fkey" FOREIGN KEY (term_id) REFERENCES public."Term"(term_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Submission Submission_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Submission Submission_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public."Event"(event_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Submission Submission_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public."Team"(team_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TaskAssignment TaskAssignment_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public."Task"(task_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TaskAssignment TaskAssignment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_authorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Project"(project_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Team Team_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public."Section"(section_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Teammember Teammember_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teammember"
    ADD CONSTRAINT "Teammember_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public."Team"(team_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Teammember Teammember_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teammember"
    ADD CONSTRAINT "Teammember_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(users_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--


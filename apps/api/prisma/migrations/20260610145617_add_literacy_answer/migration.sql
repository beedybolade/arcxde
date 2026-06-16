/*
  Warnings:

  - You are about to drop the `user_onboarding_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_onboarding_results" DROP CONSTRAINT "user_onboarding_results_user_id_fkey";

-- AlterTable
ALTER TABLE "admin_logs" ALTER COLUMN "id" SET DEFAULT 'alog_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "admin_users" ALTER COLUMN "id" SET DEFAULT 'adm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "assessment_attempts" ALTER COLUMN "id" SET DEFAULT 'aat_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "assessment_questions" ALTER COLUMN "id" SET DEFAULT 'aq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "assessments" ALTER COLUMN "id" SET DEFAULT 'asm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "awards" ALTER COLUMN "id" SET DEFAULT 'awd_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "briefs" ALTER COLUMN "id" SET DEFAULT 'brf_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "course_awards" ALTER COLUMN "id" SET DEFAULT 'ca_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "course_catalogs" ALTER COLUMN "id" SET DEFAULT 'cat_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "id" SET DEFAULT 'crs_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "email_verification_sessions" ALTER COLUMN "id" SET DEFAULT 'evs_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "faq_items" ALTER COLUMN "id" SET DEFAULT 'faq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "feeds" ALTER COLUMN "id" SET DEFAULT 'feed_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "glossary_terms" ALTER COLUMN "id" SET DEFAULT 'gloss_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "identities" ALTER COLUMN "id" SET DEFAULT 'iden_' ||gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "lessons" ALTER COLUMN "id" SET DEFAULT 'les_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "leveling_quizzes" ALTER COLUMN "id" SET DEFAULT 'quiz_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "libraries" ALTER COLUMN "id" SET DEFAULT 'lib_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "media" ALTER COLUMN "id" SET DEFAULT 'med_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "id" SET DEFAULT 'mem_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "id" SET DEFAULT 'mod_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "news" ALTER COLUMN "id" SET DEFAULT 'news_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "news_read" ALTER COLUMN "id" SET DEFAULT 'nr_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "oauth_connections" ALTER COLUMN "id" SET DEFAULT 'oauth_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "onboarding_questions" ALTER COLUMN "id" SET DEFAULT 'obq_' || gen_random_uuid()::text,
ALTER COLUMN "correct_answer" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "id" SET DEFAULT 'org_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "partner_apis" ALTER COLUMN "id" SET DEFAULT 'papi_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "id" SET DEFAULT 'pay_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "quiz_attempts" ALTER COLUMN "id" SET DEFAULT 'qa_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "quiz_questions" ALTER COLUMN "id" SET DEFAULT 'qq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "id" SET DEFAULT 'rev_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "rewards" ALTER COLUMN "id" SET DEFAULT 'rwd_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "saved_courses" ALTER COLUMN "id" SET DEFAULT 'sc_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "saved_media" ALTER COLUMN "id" SET DEFAULT 'sm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT 'ses_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "sso_configs" ALTER COLUMN "id" SET DEFAULT 'sso_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "team_members" ALTER COLUMN "id" SET DEFAULT 'tm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "id" SET DEFAULT 'team_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "token_balances" ALTER COLUMN "id" SET DEFAULT 'tb_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "token_prices" ALTER COLUMN "id" SET DEFAULT 'tp_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "token_transactions" ALTER COLUMN "id" SET DEFAULT 'tt_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_awards" ALTER COLUMN "id" SET DEFAULT 'ua_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_lesson_progress" ALTER COLUMN "id" SET DEFAULT 'ulp_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_onboarding" ALTER COLUMN "id" SET DEFAULT 'ubo_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_onboarding_answers" ALTER COLUMN "id" SET DEFAULT 'uba_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_rewards" ALTER COLUMN "id" SET DEFAULT 'ur_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'usr_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "verification_tokens" ALTER COLUMN "id" SET DEFAULT 'vt_' || gen_random_uuid()::text;

-- DropTable
DROP TABLE "user_onboarding_results";

-- CreateTable
CREATE TABLE "literary_questions" (
    "id" TEXT NOT NULL DEFAULT 'lq_' || gen_random_uuid()::text,
    "question_key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_answer" VARCHAR(10) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "literary_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_literary_assessments" (
    "id" TEXT NOT NULL DEFAULT 'ula_' || gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_literary_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_literary_answers" (
    "id" TEXT NOT NULL DEFAULT 'ula_' || gen_random_uuid()::text,
    "assessment_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option" VARCHAR(10) NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_literary_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "literary_questions_question_key_key" ON "literary_questions"("question_key");

-- CreateIndex
CREATE INDEX "literary_questions_is_active_idx" ON "literary_questions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_literary_assessments_user_id_key" ON "user_literary_assessments"("user_id");

-- CreateIndex
CREATE INDEX "user_literary_answers_assessment_id_idx" ON "user_literary_answers"("assessment_id");

-- CreateIndex
CREATE INDEX "user_literary_answers_question_id_idx" ON "user_literary_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_literary_answers_assessment_id_question_id_key" ON "user_literary_answers"("assessment_id", "question_id");

-- AddForeignKey
ALTER TABLE "user_literary_assessments" ADD CONSTRAINT "user_literary_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_literary_answers" ADD CONSTRAINT "user_literary_answers_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "user_literary_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_literary_answers" ADD CONSTRAINT "user_literary_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "literary_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

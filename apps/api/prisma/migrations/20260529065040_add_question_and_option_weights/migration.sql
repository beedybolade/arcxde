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
ALTER TABLE "faq_items" ALTER COLUMN "id" SET DEFAULT 'faq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "feeds" ALTER COLUMN "id" SET DEFAULT 'feed_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "glossary_terms" ALTER COLUMN "id" SET DEFAULT 'gloss_' || gen_random_uuid()::text;

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
ALTER TABLE "onboarding_questions" ADD COLUMN     "option_weights" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "question_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ALTER COLUMN "id" SET DEFAULT 'obq_' || gen_random_uuid()::text;

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
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT 'sess_' || gen_random_uuid()::text;

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
ALTER TABLE "user_onboarding_answers" ADD COLUMN     "selected_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "id" SET DEFAULT 'uba_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_rewards" ALTER COLUMN "id" SET DEFAULT 'ur_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'usr_' || gen_random_uuid()::text;

-- CreateTable
CREATE TABLE "user_onboarding_results" (
    "id" TEXT NOT NULL DEFAULT 'ubr_' || gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "normalized_score" DOUBLE PRECISION NOT NULL,
    "profile_key" TEXT,
    "computed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_onboarding_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_results_user_id_key" ON "user_onboarding_results"("user_id");

-- AddForeignKey
ALTER TABLE "user_onboarding_results" ADD CONSTRAINT "user_onboarding_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

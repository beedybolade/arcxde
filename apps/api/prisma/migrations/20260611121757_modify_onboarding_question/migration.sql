/*
  Warnings:

  - You are about to drop the column `option_weights` on the `onboarding_questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_weight` on the `onboarding_questions` table. All the data in the column will be lost.

*/
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
ALTER TABLE "literary_questions" ALTER COLUMN "id" SET DEFAULT 'lq_' || gen_random_uuid()::text;

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
ALTER TABLE "onboarding_questions" DROP COLUMN "option_weights",
DROP COLUMN "question_weight",
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
ALTER TABLE "user_literary_answers" ALTER COLUMN "id" SET DEFAULT 'ula_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_literary_assessments" ALTER COLUMN "id" SET DEFAULT 'ula_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_onboarding" ALTER COLUMN "id" SET DEFAULT 'ubo_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_onboarding_answers" ALTER COLUMN "id" SET DEFAULT 'uba_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_onboarding_results" ALTER COLUMN "id" SET DEFAULT 'ubr_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_rewards" ALTER COLUMN "id" SET DEFAULT 'ur_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'usr_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "verification_tokens" ALTER COLUMN "id" SET DEFAULT 'vt_' || gen_random_uuid()::text;

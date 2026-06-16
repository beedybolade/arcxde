-- AlterTable
ALTER TABLE "identities" ADD COLUMN "reset_token" TEXT,
ADD COLUMN "reset_token_expiry" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "identities_reset_token_key" ON "identities"("reset_token");

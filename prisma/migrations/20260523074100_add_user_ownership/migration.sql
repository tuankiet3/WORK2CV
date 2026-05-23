-- DropIndex
DROP INDEX "Tag_name_category_key";

-- DropIndex
DROP INDEX "WeeklyReview_weekStart_weekEnd_key";

-- AlterTable
ALTER TABLE "CvBullet" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WeeklyReview" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkLog" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CvBullet_userId_idx" ON "CvBullet"("userId");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_category_userId_key" ON "Tag"("name", "category", "userId");

-- CreateIndex
CREATE INDEX "WeeklyReview_userId_idx" ON "WeeklyReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_weekStart_weekEnd_userId_key" ON "WeeklyReview"("weekStart", "weekEnd", "userId");

-- CreateIndex
CREATE INDEX "WorkLog_userId_idx" ON "WorkLog"("userId");

-- CreateTable
CREATE TABLE "WorkLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" TEXT NOT NULL,
    "impactLevel" TEXT NOT NULL,
    "problem" TEXT,
    "solution" TEXT,
    "learning" TEXT,
    "links" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkLogTag" (
    "workLogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "WorkLogTag_pkey" PRIMARY KEY ("workLogId","tagId")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "shipped" TEXT,
    "blockers" TEXT,
    "learned" TEXT,
    "collaboration" TEXT,
    "nextFocus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvBullet" (
    "id" TEXT NOT NULL,
    "sourceLogIds" TEXT[],
    "content" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvBullet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkLog_date_idx" ON "WorkLog"("date");

-- CreateIndex
CREATE INDEX "WorkLog_taskType_idx" ON "WorkLog"("taskType");

-- CreateIndex
CREATE INDEX "WorkLog_impactLevel_idx" ON "WorkLog"("impactLevel");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_category_key" ON "Tag"("name", "category");

-- CreateIndex
CREATE INDEX "WorkLogTag_workLogId_idx" ON "WorkLogTag"("workLogId");

-- CreateIndex
CREATE INDEX "WorkLogTag_tagId_idx" ON "WorkLogTag"("tagId");

-- CreateIndex
CREATE INDEX "WeeklyReview_weekStart_idx" ON "WeeklyReview"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_weekStart_weekEnd_key" ON "WeeklyReview"("weekStart", "weekEnd");

-- CreateIndex
CREATE INDEX "CvBullet_tone_idx" ON "CvBullet"("tone");

-- AddForeignKey
ALTER TABLE "WorkLogTag" ADD CONSTRAINT "WorkLogTag_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "WorkLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLogTag" ADD CONSTRAINT "WorkLogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

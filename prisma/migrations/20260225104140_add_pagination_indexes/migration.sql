-- CreateIndex
CREATE INDEX "courses_created_at_idx" ON "courses"("created_at");

-- CreateIndex
CREATE INDEX "resources_topic_id_created_at_idx" ON "resources"("topic_id", "created_at");

-- CreateIndex
CREATE INDEX "topics_course_id_created_at_idx" ON "topics"("course_id", "created_at");

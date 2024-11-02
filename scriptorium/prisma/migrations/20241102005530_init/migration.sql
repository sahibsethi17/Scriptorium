-- CreateTable
CREATE TABLE "_BlogToTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlogToTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogToTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BlogToTemplate_AB_unique" ON "_BlogToTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogToTemplate_B_index" ON "_BlogToTemplate"("B");

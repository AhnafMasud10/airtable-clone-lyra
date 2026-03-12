/*
  Warnings:

  - Added the required column `ownerId` to the `Base` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Base" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Base_ownerId_idx" ON "Base"("ownerId");

-- AddForeignKey
ALTER TABLE "Base" ADD CONSTRAINT "Base_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

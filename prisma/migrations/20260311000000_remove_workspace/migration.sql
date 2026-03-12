-- DropForeignKey
ALTER TABLE "Base" DROP CONSTRAINT IF EXISTS "Base_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Base" DROP COLUMN IF EXISTS "workspaceId";

-- DropTable
DROP TABLE IF EXISTS "Workspace";

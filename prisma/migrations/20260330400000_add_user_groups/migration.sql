-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroupDepartment" (
    "id" TEXT NOT NULL,
    "userGroupId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "UserGroupDepartment_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "userGroupId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserGroupDepartment_userGroupId_departmentId_key" ON "UserGroupDepartment"("userGroupId", "departmentId");

-- CreateIndex
CREATE INDEX "UserGroupDepartment_userGroupId_idx" ON "UserGroupDepartment"("userGroupId");

-- CreateIndex
CREATE INDEX "UserGroupDepartment_departmentId_idx" ON "UserGroupDepartment"("departmentId");

-- CreateIndex
CREATE INDEX "User_userGroupId_idx" ON "User"("userGroupId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupDepartment" ADD CONSTRAINT "UserGroupDepartment_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupDepartment" ADD CONSTRAINT "UserGroupDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

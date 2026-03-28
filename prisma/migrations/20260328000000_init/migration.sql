-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLANNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "licenseTypes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverSkill" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "DriverSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverEmploymentRecord" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "employmentType" TEXT NOT NULL,
    "employerId" TEXT,

    CONSTRAINT "DriverEmploymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverFunctionRecord" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "position" TEXT NOT NULL,
    "locationId" TEXT,
    "departmentId" TEXT,
    "manager" TEXT,

    CONSTRAINT "DriverFunctionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverRosterAssignment" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "rosterProfileId" TEXT NOT NULL,
    "weeklyHours" DOUBLE PRECISION,

    CONSTRAINT "DriverRosterAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningEntry" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "leaveTypeId" TEXT,
    "sickPercentage" INTEGER,
    "notes" TEXT,
    "scenarioId" TEXT,

    CONSTRAINT "PlanningEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterProfileDay" (
    "id" TEXT NOT NULL,
    "rosterProfileId" TEXT NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "RosterProfileDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserPreference_userId_idx" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key_key" ON "UserPreference"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_code_key" ON "Employer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_code_key" ON "LeaveType"("code");

-- CreateIndex
CREATE INDEX "Driver_lastName_firstName_idx" ON "Driver"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Driver_isActive_idx" ON "Driver"("isActive");

-- CreateIndex
CREATE INDEX "DriverSkill_driverId_idx" ON "DriverSkill"("driverId");

-- CreateIndex
CREATE INDEX "DriverSkill_skillId_idx" ON "DriverSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverSkill_driverId_skillId_key" ON "DriverSkill"("driverId", "skillId");

-- CreateIndex
CREATE INDEX "DriverEmploymentRecord_driverId_idx" ON "DriverEmploymentRecord"("driverId");

-- CreateIndex
CREATE INDEX "DriverFunctionRecord_driverId_idx" ON "DriverFunctionRecord"("driverId");

-- CreateIndex
CREATE INDEX "DriverRosterAssignment_driverId_idx" ON "DriverRosterAssignment"("driverId");

-- CreateIndex
CREATE INDEX "PlanningEntry_driverId_idx" ON "PlanningEntry"("driverId");

-- CreateIndex
CREATE INDEX "PlanningEntry_date_idx" ON "PlanningEntry"("date");

-- CreateIndex
CREATE INDEX "PlanningEntry_scenarioId_idx" ON "PlanningEntry"("scenarioId");

-- CreateIndex
CREATE INDEX "PlanningEntry_driverId_date_idx" ON "PlanningEntry"("driverId", "date");

-- CreateIndex: Partial unique indexes for PlanningEntry duplicate prevention
-- Only one entry per driver/date per named scenario
CREATE UNIQUE INDEX "PlanningEntry_driver_date_scenario" ON "PlanningEntry" ("driverId", "date", "scenarioId") WHERE "scenarioId" IS NOT NULL;

-- Only one entry per driver/date for the default (NULL) scenario
CREATE UNIQUE INDEX "PlanningEntry_driver_date_default" ON "PlanningEntry" ("driverId", "date") WHERE "scenarioId" IS NULL;

-- CreateIndex
CREATE INDEX "RosterProfileDay_rosterProfileId_idx" ON "RosterProfileDay"("rosterProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "RosterProfileDay_rosterProfileId_dayOffset_key" ON "RosterProfileDay"("rosterProfileId", "dayOffset");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverSkill" ADD CONSTRAINT "DriverSkill_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverSkill" ADD CONSTRAINT "DriverSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverEmploymentRecord" ADD CONSTRAINT "DriverEmploymentRecord_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverEmploymentRecord" ADD CONSTRAINT "DriverEmploymentRecord_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverFunctionRecord" ADD CONSTRAINT "DriverFunctionRecord_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverFunctionRecord" ADD CONSTRAINT "DriverFunctionRecord_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverFunctionRecord" ADD CONSTRAINT "DriverFunctionRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverRosterAssignment" ADD CONSTRAINT "DriverRosterAssignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverRosterAssignment" ADD CONSTRAINT "DriverRosterAssignment_rosterProfileId_fkey" FOREIGN KEY ("rosterProfileId") REFERENCES "RosterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningEntry" ADD CONSTRAINT "PlanningEntry_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningEntry" ADD CONSTRAINT "PlanningEntry_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningEntry" ADD CONSTRAINT "PlanningEntry_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterProfileDay" ADD CONSTRAINT "RosterProfileDay_rosterProfileId_fkey" FOREIGN KEY ("rosterProfileId") REFERENCES "RosterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

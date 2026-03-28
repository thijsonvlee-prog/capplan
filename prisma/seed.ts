import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // === Master Data: Employers ===
  const emp1 = await prisma.employer.upsert({
    where: { code: "CAPPLAN" },
    update: {},
    create: { id: "emp1", code: "CAPPLAN", description: "CapPlan BV" },
  });
  const emp2 = await prisma.employer.upsert({
    where: { code: "TRANSNL" },
    update: {},
    create: { id: "emp2", code: "TRANSNL", description: "TransNL BV" },
  });
  const emp3 = await prisma.employer.upsert({
    where: { code: "LOGEXP" },
    update: {},
    create: { id: "emp3", code: "LOGEXP", description: "LogistiekExpert BV" },
  });

  // === Master Data: Departments ===
  const dep1 = await prisma.department.upsert({
    where: { code: "DIST" },
    update: {},
    create: { id: "dep1", code: "DIST", description: "Distributie" },
  });
  const dep2 = await prisma.department.upsert({
    where: { code: "LOG" },
    update: {},
    create: { id: "dep2", code: "LOG", description: "Logistiek" },
  });
  const dep3 = await prisma.department.upsert({
    where: { code: "INT" },
    update: {},
    create: { id: "dep3", code: "INT", description: "Internationaal" },
  });

  // === Master Data: Locations ===
  const loc1 = await prisma.location.upsert({
    where: { code: "AMS" },
    update: {},
    create: { id: "loc1", code: "AMS", description: "Amsterdam" },
  });
  const loc2 = await prisma.location.upsert({
    where: { code: "RTD" },
    update: {},
    create: { id: "loc2", code: "RTD", description: "Rotterdam" },
  });
  const loc3 = await prisma.location.upsert({
    where: { code: "UTR" },
    update: {},
    create: { id: "loc3", code: "UTR", description: "Utrecht" },
  });
  const loc4 = await prisma.location.upsert({
    where: { code: "DH" },
    update: {},
    create: { id: "loc4", code: "DH", description: "Den Haag" },
  });

  // === Master Data: Leave Types ===
  await prisma.leaveType.upsert({
    where: { code: "VAK" },
    update: {},
    create: { id: "lt1", code: "VAK", description: "Vakantie" },
  });
  await prisma.leaveType.upsert({
    where: { code: "ADV" },
    update: {},
    create: { id: "lt2", code: "ADV", description: "ADV-dag" },
  });
  await prisma.leaveType.upsert({
    where: { code: "BV" },
    update: {},
    create: { id: "lt3", code: "BV", description: "Bijzonder verlof" },
  });
  await prisma.leaveType.upsert({
    where: { code: "OV" },
    update: {},
    create: { id: "lt4", code: "OV", description: "Onbetaald verlof" },
  });

  // === Master Data: Skills ===
  const sk1 = await prisma.skill.upsert({
    where: { id: "sk1" },
    update: {},
    create: { id: "sk1", name: "ADR" },
  });
  const sk2 = await prisma.skill.upsert({
    where: { id: "sk2" },
    update: {},
    create: { id: "sk2", name: "Koelvervoer" },
  });
  const sk3 = await prisma.skill.upsert({
    where: { id: "sk3" },
    update: {},
    create: { id: "sk3", name: "Containertransport" },
  });
  const sk4 = await prisma.skill.upsert({
    where: { id: "sk4" },
    update: {},
    create: { id: "sk4", name: "Bulkvervoer" },
  });

  // === Roster Profiles ===
  // Profile 1: Standard 5-day work week
  const profile1 = await prisma.rosterProfile.upsert({
    where: { id: "rp1" },
    update: {},
    create: { id: "rp1", name: "Standaard 5-daags" },
  });
  // Create 28 days: Mon-Fri BASE_ROSTER, Sat-Sun ROSTER_FREE
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      const offset = week * 7 + day;
      const status = day < 5 ? "BASE_ROSTER" : "ROSTER_FREE";
      await prisma.rosterProfileDay.upsert({
        where: { rosterProfileId_dayOffset: { rosterProfileId: "rp1", dayOffset: offset } },
        update: { status },
        create: { rosterProfileId: "rp1", dayOffset: offset, status },
      });
    }
  }

  // Profile 2: 4-day work week with Friday off
  const profile2 = await prisma.rosterProfile.upsert({
    where: { id: "rp2" },
    update: {},
    create: { id: "rp2", name: "4-daags (vrij op vrijdag)" },
  });
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      const offset = week * 7 + day;
      const status = day < 4 ? "BASE_ROSTER" : "ROSTER_FREE";
      await prisma.rosterProfileDay.upsert({
        where: { rosterProfileId_dayOffset: { rosterProfileId: "rp2", dayOffset: offset } },
        update: { status },
        create: { rosterProfileId: "rp2", dayOffset: offset, status },
      });
    }
  }

  // Profile 3: Alternating with extra availability
  const profile3 = await prisma.rosterProfile.upsert({
    where: { id: "rp3" },
    update: {},
    create: { id: "rp3", name: "Wisselend met beschikbaarheid" },
  });
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      const offset = week * 7 + day;
      let status: string;
      if (day >= 5) status = "ROSTER_FREE";
      else if (week % 2 === 0) status = "BASE_ROSTER";
      else status = day < 3 ? "BASE_ROSTER" : "AVAILABLE_EXTRA";
      await prisma.rosterProfileDay.upsert({
        where: { rosterProfileId_dayOffset: { rosterProfileId: "rp3", dayOffset: offset } },
        update: { status },
        create: { rosterProfileId: "rp3", dayOffset: offset, status },
      });
    }
  }

  // === Drivers ===
  const driversData = [
    {
      id: "d1", firstName: "Jan", lastName: "de Vries", employeeNumber: "EMP001",
      licenseTypes: ["C", "CE"], skillIds: ["sk1", "sk2"],
      employment: { employmentType: "FULLTIME", employerId: "emp1" },
      function: { position: "Chauffeur", locationId: "loc1", departmentId: "dep1", manager: "" },
    },
    {
      id: "d2", firstName: "Pieter", lastName: "Bakker", employeeNumber: "EMP002",
      licenseTypes: ["C"], skillIds: ["sk1"],
      employment: { employmentType: "FULLTIME", employerId: "emp1" },
      function: { position: "Chauffeur", locationId: "loc2", departmentId: "dep1", manager: "" },
    },
    {
      id: "d3", firstName: "Klaas", lastName: "Jansen", employeeNumber: "EMP003",
      licenseTypes: ["C", "CE"], skillIds: ["sk1", "sk3"],
      employment: { employmentType: "PARTTIME", employerId: "emp1" },
      function: { position: "Chauffeur", locationId: "loc1", departmentId: "dep2", manager: "Jan de Vries" },
    },
    {
      id: "d4", firstName: "Henk", lastName: "van Dijk", employeeNumber: undefined,
      licenseTypes: ["CE"], skillIds: ["sk2"],
      employment: { employmentType: "CHARTER", employerId: "emp2" },
      function: { position: "Chauffeur", locationId: "loc3", departmentId: undefined, manager: "" },
    },
    {
      id: "d5", firstName: "Willem", lastName: "Smit", employeeNumber: undefined,
      licenseTypes: ["C"], skillIds: [],
      employment: { employmentType: "TEMPORARY", employerId: undefined },
      function: { position: "Chauffeur", locationId: "loc4", departmentId: undefined, manager: "" },
    },
    {
      id: "d6", firstName: "Thomas", lastName: "Visser", employeeNumber: "EMP006",
      licenseTypes: ["C", "CE", "D"], skillIds: ["sk1", "sk4"],
      employment: { employmentType: "FULLTIME", employerId: "emp1" },
      function: { position: "Senior Chauffeur", locationId: "loc1", departmentId: "dep1", manager: "" },
    },
    {
      id: "d7", firstName: "Erik", lastName: "de Groot", employeeNumber: "EMP007",
      licenseTypes: ["C"], skillIds: ["sk3"],
      employment: { employmentType: "PARTTIME", employerId: "emp3" },
      function: { position: "Chauffeur", locationId: "loc2", departmentId: "dep3", manager: "Thomas Visser" },
    },
    {
      id: "d8", firstName: "Marco", lastName: "Mulder", employeeNumber: "EMP008",
      licenseTypes: ["C", "CE"], skillIds: ["sk1", "sk2", "sk3"],
      employment: { employmentType: "FULLTIME", employerId: "emp2" },
      function: { position: "Chauffeur", locationId: "loc3", departmentId: "dep2", manager: "" },
    },
  ];

  for (const d of driversData) {
    const driver = await prisma.driver.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        employeeNumber: d.employeeNumber || null,
        licenseTypes: d.licenseTypes,
        isActive: true,
      },
    });

    // Skills
    for (const skillId of d.skillIds) {
      await prisma.driverSkill.upsert({
        where: { driverId_skillId: { driverId: d.id, skillId } },
        update: {},
        create: { driverId: d.id, skillId },
      });
    }

    // Employment record
    const existingEmp = await prisma.driverEmploymentRecord.findFirst({ where: { driverId: d.id } });
    if (!existingEmp) {
      await prisma.driverEmploymentRecord.create({
        data: {
          driverId: d.id,
          sequenceNumber: 1,
          startDate: "2024-01-01",
          employmentType: d.employment.employmentType,
          employerId: d.employment.employerId || null,
        },
      });
    }

    // Function record
    const existingFunc = await prisma.driverFunctionRecord.findFirst({ where: { driverId: d.id } });
    if (!existingFunc) {
      await prisma.driverFunctionRecord.create({
        data: {
          driverId: d.id,
          sequenceNumber: 1,
          startDate: "2024-01-01",
          position: d.function.position,
          locationId: d.function.locationId || null,
          departmentId: d.function.departmentId || null,
          manager: d.function.manager || null,
        },
      });
    }
  }

  // === Roster Assignments for some drivers ===
  // Assign standard 5-day roster to drivers d1, d2, d6
  for (const driverId of ["d1", "d2", "d6"]) {
    const existingAssignment = await prisma.driverRosterAssignment.findFirst({ where: { driverId } });
    if (!existingAssignment) {
      await prisma.driverRosterAssignment.create({
        data: {
          driverId,
          sequenceNumber: 1,
          startDate: "2024-01-01",
          rosterProfileId: "rp1",
          weeklyHours: 40,
        },
      });
    }
  }

  // Assign 4-day roster to driver d3
  const existingD3Roster = await prisma.driverRosterAssignment.findFirst({ where: { driverId: "d3" } });
  if (!existingD3Roster) {
    await prisma.driverRosterAssignment.create({
      data: {
        driverId: "d3",
        sequenceNumber: 1,
        startDate: "2024-01-01",
        rosterProfileId: "rp2",
        weeklyHours: 32,
      },
    });
  }

  // === Generate Planning Entries ===
  // Generate 90 days of planning from today based on roster profiles
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from last Monday
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + mondayOffset);

  const rosterAssignments = await prisma.driverRosterAssignment.findMany({
    include: { rosterProfile: { include: { days: true } } },
  });

  for (const assignment of rosterAssignments) {
    const profile = assignment.rosterProfile;
    if (!profile) continue;

    for (let day = 0; day < 90; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split("T")[0];
      const dayOffset = day % 28;
      const profileDay = profile.days.find((d) => d.dayOffset === dayOffset);
      const status = profileDay?.status || "ROSTER_FREE";

      await prisma.planningEntry.upsert({
        where: {
          id: `seed-${assignment.driverId}-${dateStr}`,
        },
        update: { status },
        create: {
          id: `seed-${assignment.driverId}-${dateStr}`,
          driverId: assignment.driverId,
          date: dateStr,
          status,
          scenarioId: null,
        },
      });
    }
  }

  // Add some leave and sick entries
  const leaveDate1 = new Date(startDate);
  leaveDate1.setDate(leaveDate1.getDate() + 14); // 2 weeks from start
  for (let i = 0; i < 5; i++) {
    const date = new Date(leaveDate1);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    await prisma.planningEntry.upsert({
      where: { id: `seed-d1-${dateStr}` },
      update: { status: "LEAVE", leaveTypeId: "lt1" },
      create: {
        id: `seed-d1-${dateStr}`,
        driverId: "d1",
        date: dateStr,
        status: "LEAVE",
        leaveTypeId: "lt1",
        scenarioId: null,
      },
    });
  }

  // Driver d2 sick for 3 days
  const sickDate = new Date(startDate);
  sickDate.setDate(sickDate.getDate() + 7);
  for (let i = 0; i < 3; i++) {
    const date = new Date(sickDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    await prisma.planningEntry.upsert({
      where: { id: `seed-d2-${dateStr}` },
      update: { status: "SICK", sickPercentage: 0 },
      create: {
        id: `seed-d2-${dateStr}`,
        driverId: "d2",
        date: dateStr,
        status: "SICK",
        sickPercentage: 0,
        scenarioId: null,
      },
    });
  }

  // === Default User ===
  await prisma.user.upsert({
    where: { email: "admin@capplan.nl" },
    update: {},
    create: {
      id: "default",
      name: "Admin",
      email: "admin@capplan.nl",
      role: "ADMIN",
    },
  });

  // === Sample Scenario ===
  const scenario = await prisma.scenario.upsert({
    where: { id: "scenario1" },
    update: {},
    create: {
      id: "scenario1",
      name: "Zomerplanning 2026",
      description: "Concept planning voor de zomerperiode",
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

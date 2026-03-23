import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@capplan.dev" },
    update: {},
    create: {
      email: "admin@capplan.dev",
      name: "Admin",
      role: "ADMIN",
    },
  });

  // Create sample drivers
  const drivers = [
    { firstName: "Jan", lastName: "de Vries", type: "INTERNAL" as const, employeeNumber: "EMP001" },
    { firstName: "Pieter", lastName: "Bakker", type: "INTERNAL" as const, employeeNumber: "EMP002" },
    { firstName: "Klaas", lastName: "Jansen", type: "INTERNAL" as const, employeeNumber: "EMP003" },
    { firstName: "Henk", lastName: "van Dijk", type: "CHARTER" as const, companyName: "TransNL BV" },
    { firstName: "Willem", lastName: "Smit", type: "TEMPORARY" as const },
  ];

  for (const d of drivers) {
    await prisma.driver.upsert({
      where: { id: d.employeeNumber || `${d.firstName}-${d.lastName}` },
      update: {},
      create: d,
    });
  }

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { newEnforcer } from "casbin";
import { PrismaAdapter } from "casbin-prisma-adapter";

import { ROLES } from "../../constants/index";
import {
  patientDisciplines,
  payers,
  taxonomy as taxonomies,
} from "../../constants/taxonomy";
import { createLog, log, prisma } from "..";

const enforcer = async () => {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer("model.conf", a);
  return e;
};

export async function seed() {
  const e = await enforcer();

  const hashedPassword = await bcrypt.hash("password", 10);

  // Create Provider
  const provider = await prisma.provider.create({
    data: {
      providerName: faker.company.name(),
      email: faker.internet.email().toLowerCase(),
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      providerName: faker.company.name(),
      email: faker.internet.email().toLowerCase(),
    },
  });

  // Create Login User
  const user = await prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: hashedPassword,
      email: faker.internet.email().toLowerCase(),
      image: {
        create: {
          src: faker.image.avatar(),
          mediaId: uuidv4(),
          fileType: "IMG",
        },
      },
      UserProvider: {
        create: {
          providerId: provider.id,
        },
      },
    },
  });
  await e.addNamedPolicy("p", user.id, "administrator", provider.id);

  // Create Admin Role
  let permission;
  permission = await prisma.permission.findUnique({
    where: {
      name: "All",
    },
  });
  if (!permission) {
    permission = await prisma.permission.create({
      data: {
        name: "All",
      },
    });
  }

  const userWithMultipleProviders = await prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: hashedPassword,
      email: faker.internet.email().toLowerCase(),
      image: {
        create: {
          src: faker.image.avatar(),
          mediaId: uuidv4(),
          fileType: "IMG",
        },
      },
      UserProvider: {
        createMany: {
          data: [
            {
              providerId: provider.id,
            },
            {
              providerId: provider2.id,
            },
          ],
        },
      },
    },
  });
  await e.addNamedPolicy(
    "p",
    userWithMultipleProviders.id,
    "administrator",
    provider.id,
  );
  await e.addNamedPolicy(
    "p",
    userWithMultipleProviders.id,
    "administrator",
    provider2.id,
  );

  // Create Other Users
  const numberOfUsersPerRole = 5;
  for (let i = 1; i <= numberOfUsersPerRole * ROLES.length; i++) {
    const roles = ROLES.map((role) => role.value);
    const role = roles[Math.floor((i - 1) / numberOfUsersPerRole)];
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: hashedPassword,
        email: faker.internet.email().toLowerCase(),
        image: {
          create: {
            src: faker.image.avatar(),
            mediaId: uuidv4(),
            fileType: "IMG",
          },
        },
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
    });
    await e.addNamedPolicy("p", user.id, role, provider.id);
  }

  // create a caregiver

  const caregiver = await prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: hashedPassword,
      email: faker.internet.email().toLowerCase(),
      image: {
        create: {
          src: faker.image.avatar(),
          mediaId: uuidv4(),
          fileType: "IMG",
        },
      },
      UserProvider: {
        create: {
          providerId: provider.id,
        },
      },
    },
  });
  await e.addNamedPolicy("p", caregiver.id, "caregiver", provider.id);

  // create patient
  const numberOfPatientsPerStatus = 5;
  for (let i = 1; i <= numberOfPatientsPerStatus * 4; i++) {
    const status = ["REFERRED", "ACTIVE", "DISCHARGED", "ARCHIVED"];
    const patientStatus =
      status[Math.floor((i - 1) / numberOfPatientsPerStatus)];
    const patient = await prisma.patientAdmission.create({
      data: {
        patient: {
          create: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            providerId: provider.id,
          },
        },
        status: patientStatus,
      },
    });
    await createLog(
      "PATIENT",
      `Patient ${patientStatus.toLowerCase() === "referred" ? "created" : patientStatus.toLowerCase() === "active" ? "admitted" : patientStatus.toLowerCase()}`,
      patient.patientId,
    );
  }

  // create Taxonomy and Taxonomy code
  const createTaxonomies = taxonomies.map(
    (taxonomy: { value: string; code: { value: string }[] }) =>
      new Promise((resolve, reject) => {
        (async () => {
          try {
            const exists = await prisma.taxonomy.findFirst({
              where: { name: taxonomy.value },
            });
            if (!exists) {
              await prisma.taxonomy.create({
                data: {
                  name: taxonomy.value,
                  codes: {
                    createMany: {
                      data: taxonomy.code.map((code) => ({
                        code: code.value,
                      })),
                    },
                  },
                },
              });
            }
            resolve(null);
          } catch (err) {
            reject(err);
          }
        })();
      }),
  );
  const createDisciplines = patientDisciplines.map(
    (discipline: { value: string; label: string }) =>
      new Promise((resolve, reject) => {
        (async () => {
          try {
            const exists = await prisma.discipline.findFirst({
              where: { name: discipline.value },
            });
            if (!exists) {
              await prisma.discipline.create({
                data: {
                  name: discipline.value,
                },
              });
            }
            resolve(null);
          } catch (err) {
            reject(err);
          }
        })();
      }),
  );

  const createPayers = payers.map(
    (payer: { value: string; label: string }) =>
      new Promise((resolve, reject) => {
        (async () => {
          try {
            const exists = await prisma.payer.findFirst({
              where: { name: payer.value },
            });
            if (!exists) {
              await prisma.payer.create({
                data: {
                  name: payer.value,
                  provider: {
                    connect: {
                      id: provider.id,
                    },
                  },
                },
              });
            }
            resolve(null);
          } catch (err) {
            reject(err);
          }
        })();
      }),
  );

  await Promise.all([createTaxonomies, createDisciplines, createPayers]);
  log(`Admin user created: \u001b[1m\u001b[33m${user.email}\u001b[0m`);
  log(`Caregiver created: \u001b[1m\u001b[33m${caregiver.email}\u001b[0m`);
  log(
    `Admin user with multiple providers created: \u001b[1m\u001b[33m${userWithMultipleProviders.email}\u001b[0m`,
  );
}

/**
 * Seed script for HR Compliance features
 * Run with: npx ts-node scripts/seed-hr-compliance.ts
 * Or: npx tsx scripts/seed-hr-compliance.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting HR Compliance seed...\n");

  // Find the admin user and their company
  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@carebase.com" },
    include: { company: true },
  });

  if (!adminUser || !adminUser.company) {
    console.error("Admin user (admin@carebase.com) not found. Please seed basic data first.");
    process.exit(1);
  }

  const company = adminUser.company;
  console.log(`Using company: ${company.name} (${company.id})\n`);
  console.log(`Admin user: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})\n`);

  // Get staff members for relationships
  const staff = await prisma.user.findMany({
    where: { companyId: company.id },
    take: 10,
  });

  if (staff.length < 2) {
    console.error("Need at least 2 staff members. Please seed users first.");
    process.exit(1);
  }

  // Get a client for supervision visits
  const client = await prisma.client.findFirst({
    where: { companyId: company.id },
  });

  console.log(`Found ${staff.length} staff members\n`);

  // ============================================
  // 1. SEED COMPETENCIES
  // ============================================
  console.log("Creating competencies...");

  const competencies = await Promise.all([
    // Clinical Skills
    prisma.competency.upsert({
      where: { id: "comp-medication-admin" },
      update: {},
      create: {
        id: "comp-medication-admin",
        companyId: company.id,
        name: "Medication Administration",
        description: "Ability to safely administer medications including oral, topical, and injectable forms. Includes proper documentation and adverse reaction monitoring.",
        category: "CLINICAL_SKILLS",
        assessmentMethod: "DIRECT_OBSERVATION",
        passingScore: 85,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF"],
        isActive: true,
      },
    }),
    prisma.competency.upsert({
      where: { id: "comp-wound-care" },
      update: {},
      create: {
        id: "comp-wound-care",
        companyId: company.id,
        name: "Wound Care & Dressing Changes",
        description: "Competency in wound assessment, cleaning, and dressing application. Includes sterile technique and documentation.",
        category: "CLINICAL_SKILLS",
        assessmentMethod: "DIRECT_OBSERVATION",
        passingScore: 90,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF"],
        isActive: true,
      },
    }),
    prisma.competency.upsert({
      where: { id: "comp-vital-signs" },
      update: {},
      create: {
        id: "comp-vital-signs",
        companyId: company.id,
        name: "Vital Signs Measurement",
        description: "Accurate measurement and documentation of blood pressure, pulse, temperature, respirations, and oxygen saturation.",
        category: "CLINICAL_SKILLS",
        assessmentMethod: "SKILLS_DEMONSTRATION",
        passingScore: 100,
        validityMonths: 24,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),

    // Safety
    prisma.competency.upsert({
      where: { id: "comp-fall-prevention" },
      update: {},
      create: {
        id: "comp-fall-prevention",
        companyId: company.id,
        name: "Fall Prevention & Safety",
        description: "Understanding of fall risk assessment, prevention strategies, and proper response to falls.",
        category: "SAFETY_PROCEDURES",
        assessmentMethod: "WRITTEN_TEST",
        passingScore: 80,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),
    prisma.competency.upsert({
      where: { id: "comp-body-mechanics" },
      update: {},
      create: {
        id: "comp-body-mechanics",
        companyId: company.id,
        name: "Body Mechanics & Safe Lifting",
        description: "Proper techniques for lifting, transferring, and repositioning patients to prevent injury.",
        category: "SAFETY_PROCEDURES",
        assessmentMethod: "DIRECT_OBSERVATION",
        passingScore: 85,
        validityMonths: 12,
        requiredForRoles: ["CARER"],
        isActive: true,
      },
    }),

    // Infection Control
    prisma.competency.upsert({
      where: { id: "comp-hand-hygiene" },
      update: {},
      create: {
        id: "comp-hand-hygiene",
        companyId: company.id,
        name: "Hand Hygiene & Infection Control",
        description: "Proper hand washing technique, use of hand sanitizer, and understanding of infection transmission.",
        category: "INFECTION_CONTROL",
        assessmentMethod: "DIRECT_OBSERVATION",
        passingScore: 100,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),
    prisma.competency.upsert({
      where: { id: "comp-ppe" },
      update: {},
      create: {
        id: "comp-ppe",
        companyId: company.id,
        name: "PPE Donning & Doffing",
        description: "Proper technique for putting on and removing personal protective equipment.",
        category: "INFECTION_CONTROL",
        assessmentMethod: "DIRECT_OBSERVATION",
        passingScore: 100,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),

    // Documentation
    prisma.competency.upsert({
      where: { id: "comp-clinical-documentation" },
      update: {},
      create: {
        id: "comp-clinical-documentation",
        companyId: company.id,
        name: "Clinical Documentation",
        description: "Accurate, timely, and compliant clinical documentation including OASIS, visit notes, and care plans.",
        category: "DOCUMENTATION",
        assessmentMethod: "CASE_STUDY",
        passingScore: 90,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF"],
        isActive: true,
      },
    }),

    // Patient Rights
    prisma.competency.upsert({
      where: { id: "comp-patient-rights" },
      update: {},
      create: {
        id: "comp-patient-rights",
        companyId: company.id,
        name: "Patient Rights & Privacy",
        description: "Understanding of patient rights, HIPAA requirements, and privacy protections.",
        category: "PATIENT_RIGHTS",
        assessmentMethod: "WRITTEN_TEST",
        passingScore: 85,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),

    // Emergency Procedures
    prisma.competency.upsert({
      where: { id: "comp-cpr-bls" },
      update: {},
      create: {
        id: "comp-cpr-bls",
        companyId: company.id,
        name: "CPR/BLS Certification",
        description: "Current certification in cardiopulmonary resuscitation and basic life support.",
        category: "EMERGENCY_RESPONSE",
        assessmentMethod: "SKILLS_DEMONSTRATION",
        passingScore: 100,
        validityMonths: 24,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),
    prisma.competency.upsert({
      where: { id: "comp-emergency-response" },
      update: {},
      create: {
        id: "comp-emergency-response",
        companyId: company.id,
        name: "Emergency Response Procedures",
        description: "Knowledge of emergency protocols, evacuation procedures, and emergency contact procedures.",
        category: "EMERGENCY_RESPONSE",
        assessmentMethod: "SIMULATION",
        passingScore: 85,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),

    // Equipment Operation
    prisma.competency.upsert({
      where: { id: "comp-glucometer" },
      update: {},
      create: {
        id: "comp-glucometer",
        companyId: company.id,
        name: "Glucometer Operation",
        description: "Proper use of blood glucose monitoring equipment including calibration, testing, and documentation.",
        category: "EQUIPMENT_OPERATION",
        assessmentMethod: "SKILLS_DEMONSTRATION",
        passingScore: 100,
        validityMonths: 12,
        requiredForRoles: ["CLINICAL_DIRECTOR", "STAFF", "CARER"],
        isActive: true,
      },
    }),
  ]);

  console.log(`  Created ${competencies.length} competencies\n`);

  // ============================================
  // 2. SEED TRAINING COURSES
  // ============================================
  console.log("Creating training courses...");

  const courses = await Promise.all([
    // Compliance Training
    prisma.trainingCourse.upsert({
      where: { id: "course-hipaa" },
      update: {},
      create: {
        id: "course-hipaa",
        companyId: company.id,
        title: "HIPAA Privacy & Security",
        description: "Comprehensive training on HIPAA regulations, patient privacy rights, and security requirements for protected health information.",
        category: "COMPLIANCE",
        format: "ONLINE_SELF_PACED",
        durationMinutes: 60,
        ceuCredits: 1,
        contactHours: 1,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),
    prisma.trainingCourse.upsert({
      where: { id: "course-corporate-compliance" },
      update: {},
      create: {
        id: "course-corporate-compliance",
        companyId: company.id,
        title: "Corporate Compliance & Ethics",
        description: "Training on organizational compliance program, code of conduct, and ethical standards.",
        category: "COMPLIANCE",
        format: "ONLINE_SELF_PACED",
        durationMinutes: 45,
        ceuCredits: 0.75,
        contactHours: 0.75,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),
    prisma.trainingCourse.upsert({
      where: { id: "course-fraud-abuse" },
      update: {},
      create: {
        id: "course-fraud-abuse",
        companyId: company.id,
        title: "Fraud, Waste & Abuse Prevention",
        description: "Training on identifying and preventing healthcare fraud, waste, and abuse.",
        category: "COMPLIANCE",
        format: "ONLINE_SELF_PACED",
        durationMinutes: 30,
        ceuCredits: 0.5,
        contactHours: 0.5,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),

    // Infection Control
    prisma.trainingCourse.upsert({
      where: { id: "course-infection-control" },
      update: {},
      create: {
        id: "course-infection-control",
        companyId: company.id,
        title: "Infection Control Annual Update",
        description: "Annual update on infection prevention and control practices, including standard precautions and transmission-based precautions.",
        category: "INFECTION_CONTROL",
        format: "IN_PERSON",
        durationMinutes: 120,
        ceuCredits: 2,
        contactHours: 2,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),
    prisma.trainingCourse.upsert({
      where: { id: "course-bloodborne-pathogens" },
      update: {},
      create: {
        id: "course-bloodborne-pathogens",
        companyId: company.id,
        title: "Bloodborne Pathogens",
        description: "OSHA-required training on bloodborne pathogen exposure prevention and post-exposure procedures.",
        category: "INFECTION_CONTROL",
        format: "ONLINE_SELF_PACED",
        durationMinutes: 60,
        ceuCredits: 1,
        contactHours: 1,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),

    // Safety
    prisma.trainingCourse.upsert({
      where: { id: "course-fire-safety" },
      update: {},
      create: {
        id: "course-fire-safety",
        companyId: company.id,
        title: "Fire Safety & Emergency Preparedness",
        description: "Training on fire prevention, evacuation procedures, and emergency response protocols.",
        category: "SAFETY",
        format: "IN_PERSON",
        durationMinutes: 60,
        ceuCredits: 1,
        contactHours: 1,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),
    prisma.trainingCourse.upsert({
      where: { id: "course-workplace-safety" },
      update: {},
      create: {
        id: "course-workplace-safety",
        companyId: company.id,
        title: "Workplace Safety & Ergonomics",
        description: "Training on workplace hazards, safe lifting techniques, and ergonomic practices.",
        category: "SAFETY",
        format: "ONLINE_LIVE",
        durationMinutes: 90,
        ceuCredits: 1.5,
        contactHours: 1.5,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),

    // Patient Rights
    prisma.trainingCourse.upsert({
      where: { id: "course-patient-rights" },
      update: {},
      create: {
        id: "course-patient-rights",
        companyId: company.id,
        title: "Patient Rights & Responsibilities",
        description: "Training on patient rights, informed consent, advance directives, and cultural competency.",
        category: "PATIENT_RIGHTS",
        format: "ONLINE_SELF_PACED",
        durationMinutes: 45,
        ceuCredits: 0.75,
        contactHours: 0.75,
        isRecurring: true,
        recurrenceMonths: 12,
        requiredForNewHires: true,
        isActive: true,
      },
    }),

    // Clinical Skills
    prisma.trainingCourse.upsert({
      where: { id: "course-wound-care" },
      update: {},
      create: {
        id: "course-wound-care",
        companyId: company.id,
        title: "Advanced Wound Care Management",
        description: "In-depth training on wound assessment, treatment modalities, and documentation.",
        category: "CLINICAL_SKILLS",
        format: "HYBRID",
        durationMinutes: 240,
        ceuCredits: 4,
        contactHours: 4,
        isRecurring: false,
        requiredForNewHires: false,
        isActive: true,
      },
    }),
    prisma.trainingCourse.upsert({
      where: { id: "course-diabetes-management" },
      update: {},
      create: {
        id: "course-diabetes-management",
        companyId: company.id,
        title: "Diabetes Care & Management",
        description: "Comprehensive training on diabetes care including monitoring, medication management, and patient education.",
        category: "CLINICAL_SKILLS",
        format: "IN_PERSON",
        durationMinutes: 180,
        ceuCredits: 3,
        contactHours: 3,
        isRecurring: false,
        requiredForNewHires: false,
        isActive: true,
      },
    }),

    // Orientation
    prisma.trainingCourse.upsert({
      where: { id: "course-new-hire-orientation" },
      update: {},
      create: {
        id: "course-new-hire-orientation",
        companyId: company.id,
        title: "New Employee Orientation",
        description: "Comprehensive orientation for new employees covering company policies, procedures, and expectations.",
        category: "ORIENTATION",
        format: "IN_PERSON",
        durationMinutes: 480,
        ceuCredits: 0,
        contactHours: 8,
        isRecurring: false,
        requiredForNewHires: true,
        isActive: true,
      },
    }),

    // Documentation
    prisma.trainingCourse.upsert({
      where: { id: "course-oasis-training" },
      update: {},
      create: {
        id: "course-oasis-training",
        companyId: company.id,
        title: "OASIS-E Documentation Training",
        description: "Training on accurate OASIS-E assessment and documentation requirements.",
        category: "DOCUMENTATION",
        format: "ONLINE_LIVE",
        durationMinutes: 240,
        ceuCredits: 4,
        contactHours: 4,
        isRecurring: false,
        requiredForNewHires: false,
        isActive: true,
      },
    }),

    // Emergency Procedures
    prisma.trainingCourse.upsert({
      where: { id: "course-bls-certification" },
      update: {},
      create: {
        id: "course-bls-certification",
        companyId: company.id,
        title: "BLS Certification Course",
        description: "American Heart Association Basic Life Support certification course.",
        category: "EMERGENCY_PROCEDURES",
        format: "IN_PERSON",
        durationMinutes: 240,
        ceuCredits: 4,
        contactHours: 4,
        isRecurring: true,
        recurrenceMonths: 24,
        requiredForNewHires: true,
        isActive: true,
      },
    }),

    // Professional Development
    prisma.trainingCourse.upsert({
      where: { id: "course-communication-skills" },
      update: {},
      create: {
        id: "course-communication-skills",
        companyId: company.id,
        title: "Effective Communication in Healthcare",
        description: "Training on therapeutic communication, conflict resolution, and patient education techniques.",
        category: "PROFESSIONAL_DEVELOPMENT",
        format: "ONLINE_LIVE",
        durationMinutes: 120,
        ceuCredits: 2,
        contactHours: 2,
        isRecurring: false,
        requiredForNewHires: false,
        isActive: true,
      },
    }),
  ]);

  console.log(`  Created ${courses.length} training courses\n`);

  // ============================================
  // 3. SEED TRAINING SESSIONS
  // ============================================
  console.log("Creating training sessions...");

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Use admin user as instructor, or find a supervisor/clinical director
  const instructor = adminUser.role === "ADMIN" ? adminUser : (
    staff.find(s => s.role === "CLINICAL_DIRECTOR" || s.role === "SUPERVISOR") || staff[0]
  );

  const sessions = await Promise.all([
    prisma.trainingSession.upsert({
      where: { id: "session-infection-control-1" },
      update: {},
      create: {
        id: "session-infection-control-1",
        companyId: company.id,
        courseId: "course-infection-control",
        instructorId: instructor.id,
        scheduledDate: nextWeek,
        startTime: "09:00",
        endTime: "11:00",
        location: "Conference Room A",
        isVirtual: false,
        status: "SCHEDULED",
        capacity: 20,
        registeredCount: 8,
      },
    }),
    prisma.trainingSession.upsert({
      where: { id: "session-fire-safety-1" },
      update: {},
      create: {
        id: "session-fire-safety-1",
        companyId: company.id,
        courseId: "course-fire-safety",
        instructorId: instructor.id,
        scheduledDate: nextWeek,
        startTime: "13:00",
        endTime: "14:00",
        location: "Training Room",
        isVirtual: false,
        status: "SCHEDULED",
        capacity: 15,
        registeredCount: 12,
      },
    }),
    prisma.trainingSession.upsert({
      where: { id: "session-oasis-1" },
      update: {},
      create: {
        id: "session-oasis-1",
        companyId: company.id,
        courseId: "course-oasis-training",
        instructorId: instructor.id,
        scheduledDate: nextMonth,
        startTime: "09:00",
        endTime: "13:00",
        location: "Virtual - Zoom",
        virtualMeetingUrl: "https://zoom.us/j/example",
        isVirtual: true,
        status: "SCHEDULED",
        capacity: 30,
        registeredCount: 15,
      },
    }),
    prisma.trainingSession.upsert({
      where: { id: "session-bls-1" },
      update: {},
      create: {
        id: "session-bls-1",
        companyId: company.id,
        courseId: "course-bls-certification",
        instructorId: instructor.id,
        scheduledDate: nextMonth,
        startTime: "08:00",
        endTime: "12:00",
        location: "Training Center",
        isVirtual: false,
        status: "SCHEDULED",
        capacity: 12,
        registeredCount: 10,
      },
    }),
  ]);

  console.log(`  Created ${sessions.length} training sessions\n`);

  // ============================================
  // 4. SEED SUPERVISORY RELATIONSHIPS
  // ============================================
  console.log("Creating supervisory relationships...");

  // Find supervisors and supervisees
  // Include admin user as a supervisor
  const supervisors = [
    adminUser,
    ...staff.filter(s =>
      s.id !== adminUser.id && (s.role === "CLINICAL_DIRECTOR" || s.role === "SUPERVISOR" || s.role === "ADMIN")
    ),
  ];
  const supervisees = staff.filter(s =>
    s.id !== adminUser.id && (s.role === "CARER" || s.role === "STAFF")
  );

  const relationships: any[] = [];

  if (supervisees.length > 0) {
    const supervisor = adminUser; // Use admin as the supervisor

    for (let i = 0; i < Math.min(3, supervisees.length); i++) {
      const supervisee = supervisees[i];
      if (supervisor.id !== supervisee.id) {
        const rel = await prisma.supervisoryRelationship.upsert({
          where: { id: `rel-${supervisor.id}-${supervisee.id}` },
          update: {},
          create: {
            id: `rel-${supervisor.id}-${supervisee.id}`,
            companyId: company.id,
            supervisorId: supervisor.id,
            superviseeId: supervisee.id,
            relationshipType: i === 0 ? "PRIMARY" : i === 1 ? "CLINICAL" : "PRECEPTOR",
            discipline: i === 0 ? "Nursing" : i === 1 ? "Home Health" : null,
            requiredVisitFrequency: i === 0 ? "BIWEEKLY" : "MONTHLY",
            requiredHoursPerPeriod: i === 0 ? 2 : 1,
            startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            isActive: true,
          },
        });
        relationships.push(rel);
      }
    }
  }

  console.log(`  Created ${relationships.length} supervisory relationships\n`);

  // ============================================
  // 5. SEED SUPERVISION VISITS
  // ============================================
  console.log("Creating supervision visits...");

  const visits: any[] = [];

  for (const rel of relationships) {
    // Create a past completed visit
    const pastVisit = await prisma.supervisionVisit.upsert({
      where: { id: `visit-past-${rel.id}` },
      update: {},
      create: {
        id: `visit-past-${rel.id}`,
        companyId: company.id,
        relationshipId: rel.id,
        clientId: client?.id || null,
        scheduledDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        scheduledDuration: 60,
        visitDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        visitType: "JOINT_VISIT",
        status: "COMPLETED",
        actualDuration: 65,
        clinicalObservations: "Medication administration, wound care assessment, vital signs",
        documentationReview: "Visit notes reviewed for completeness and accuracy",
        strengths: "Excellent patient rapport, thorough documentation",
        areasForImprovement: "Could improve time management between visits",
        feedbackProvided: "Will work on scheduling efficiency",
        overallRating: "MEETS_EXPECTATIONS",
        supervisorSignature: "Signed by supervisor",
        supervisorSignedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
    });
    visits.push(pastVisit);

    // Create an upcoming scheduled visit
    const upcomingVisit = await prisma.supervisionVisit.upsert({
      where: { id: `visit-upcoming-${rel.id}` },
      update: {},
      create: {
        id: `visit-upcoming-${rel.id}`,
        companyId: company.id,
        relationshipId: rel.id,
        clientId: client?.id || null,
        scheduledDate: nextWeek,
        scheduledDuration: 60,
        visitType: "JOINT_VISIT",
        status: "SCHEDULED",
      },
    });
    visits.push(upcomingVisit);
  }

  console.log(`  Created ${visits.length} supervision visits\n`);

  // ============================================
  // 6. SEED STAFF COMPETENCIES
  // ============================================
  console.log("Creating staff competency assessments...");

  const staffCompetencies: any[] = [];
  const assessor = adminUser; // Use admin as the assessor

  // Assign competencies to first few staff members
  for (let i = 0; i < Math.min(3, staff.length); i++) {
    const staffMember = staff[i];

    // Assign a few competencies to each staff member
    const competenciesToAssign = competencies.slice(0, 5);

    for (const comp of competenciesToAssign) {
      const isPassed = Math.random() > 0.2; // 80% pass rate
      const score = isPassed ? 85 + Math.floor(Math.random() * 15) : 60 + Math.floor(Math.random() * 20);
      const assessedAt = new Date(now.getTime() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);

      const sc = await prisma.staffCompetency.create({
        data: {
          userId: staffMember.id,
          competencyId: comp.id,
          companyId: company.id,
          status: isPassed ? "COMPETENT" : "NEEDS_IMPROVEMENT",
          assessedAt: assessedAt,
          validUntil: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
          assessedById: assessor.id,
          score: score,
          observations: isPassed
            ? "Competency demonstrated successfully"
            : "Additional training required before reassessment",
        },
      });
      staffCompetencies.push(sc);
    }
  }

  console.log(`  Created ${staffCompetencies.length} staff competency records\n`);

  // ============================================
  // 7. SEED TRAINING ASSIGNMENTS
  // ============================================
  console.log("Creating training assignments...");

  const assignments: any[] = [];

  // Assign required training to staff
  const requiredCourses = courses.filter(c => c.requiredForNewHires);

  for (let i = 0; i < Math.min(3, staff.length); i++) {
    const staffMember = staff[i];

    for (const course of requiredCourses.slice(0, 3)) {
      const isCompleted = Math.random() > 0.3; // 70% completion rate
      const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const assignment = await prisma.trainingAssignment.create({
        data: {
          userId: staffMember.id,
          courseId: course.id,
          companyId: company.id,
          assignedById: assessor.id,
          reason: "ANNUAL_REQUIREMENT",
          dueDate: dueDate,
          status: isCompleted ? "COMPLETED" : "ASSIGNED",
          completedAt: isCompleted ? new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null,
        },
      });
      assignments.push(assignment);
    }
  }

  console.log(`  Created ${assignments.length} training assignments\n`);

  // ============================================
  // 8. SEED REMEDIATION PLANS
  // ============================================
  console.log("Creating remediation plans...");

  const remediationPlans: any[] = [];

  // Find staff with NEEDS_IMPROVEMENT competencies
  const staffNeedingRemediation = staffCompetencies.filter(sc => sc.status === "NEEDS_IMPROVEMENT");

  for (const sc of staffNeedingRemediation.slice(0, 2)) {
    const plan = await prisma.remediationPlan.create({
      data: {
        companyId: company.id,
        userId: sc.userId,
        competencyGaps: [sc.competencyId],
        identifiedById: assessor.id,
        planDescription: "Staff member did not meet minimum competency requirements during assessment. Plan includes training, supervised practice, and reassessment.",
        targetCompletionDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: "IN_PROGRESS",
      },
    });
    remediationPlans.push(plan);

    // Add remediation activities
    await prisma.remediationActivity.createMany({
      data: [
        {
          remediationPlanId: plan.id,
          activityType: "TRAINING_COURSE",
          description: "Complete online training module for competency area",
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          completionNotes: "Training module completed with 90% score",
        },
        {
          remediationPlanId: plan.id,
          activityType: "SUPERVISED_PRACTICE",
          description: "Shadow experienced staff member for 2 shifts",
          dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        },
        {
          remediationPlanId: plan.id,
          activityType: "SKILLS_LAB",
          description: "Practice skills with supervisor observation",
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          remediationPlanId: plan.id,
          activityType: "REASSESSMENT",
          description: "Complete competency reassessment with clinical supervisor",
          dueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log(`  Created ${remediationPlans.length} remediation plans with activities\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("=".repeat(50));
  console.log("HR Compliance Seed Complete!");
  console.log("=".repeat(50));
  console.log(`
Summary:
  - ${competencies.length} Competencies
  - ${courses.length} Training Courses
  - ${sessions.length} Training Sessions
  - ${relationships.length} Supervisory Relationships
  - ${visits.length} Supervision Visits
  - ${staffCompetencies.length} Staff Competency Records
  - ${assignments.length} Training Assignments
  - ${remediationPlans.length} Remediation Plans

You can now test the HR Compliance features at:
  - /training - Training Management
  - /supervision - Supervision Management
  - /settings/competencies - Competency Library
  `);
}

main()
  .catch((e) => {
    console.error("Error seeding HR Compliance data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

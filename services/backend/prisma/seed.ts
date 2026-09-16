import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Starting ICU Sentinel seed...");

    // ==========================================================
    // 1. PLAN
    // ==========================================================

    const plan = await prisma.plan.upsert({
        where: {
            name: "Professional",
        },
        update: {
            description: "ICU Sentinel professional hospital plan",
            monthlyPrice: 4999,
            maxICUs: 5,
            maxBeds: 100,
            maxUsers: 50,
        },
        create: {
            name: "Professional",
            description: "ICU Sentinel professional hospital plan",
            monthlyPrice: 4999,
            maxICUs: 5,
            maxBeds: 100,
            maxUsers: 50,
        },
    });

    // ==========================================================
    // 2. HOSPITAL
    // ==========================================================

    const hospital = await prisma.hospital.upsert({
        where: {
            code: "DEMO-HOSPITAL",
        },
        update: {
            name: "ICU Sentinel Demo Hospital",
            email: "admin@demo-hospital.local",
            phone: "+91-0000000000",
            address: "Development Environment",
            city: "Pune",
            state: "Maharashtra",
            country: "India",
            isActive: true,
        },
        create: {
            name: "ICU Sentinel Demo Hospital",
            code: "DEMO-HOSPITAL",
            email: "admin@demo-hospital.local",
            phone: "+91-0000000000",
            address: "Development Environment",
            city: "Pune",
            state: "Maharashtra",
            country: "India",
        },
    });

    // ==========================================================
    // 3. SUBSCRIPTION
    // ==========================================================

    await prisma.subscription.upsert({
        where: {
            hospitalId: hospital.id,
        },
        update: {
            planId: plan.id,
            status: "TRIAL",
        },
        create: {
            hospitalId: hospital.id,
            planId: plan.id,
            status: "TRIAL",
            startDate: new Date(),
            trialEndsAt: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000,
            ),
        },
    });

    // ==========================================================
    // 4. PASSWORD HASHES
    // ==========================================================

    const adminPasswordHash = await bcrypt.hash(
        "Admin@123",
        12,
    );

    const doctorPasswordHash = await bcrypt.hash(
        "Doctor@123",
        12,
    );

    // ==========================================================
    // 5. ADMIN
    // ==========================================================

    const admin = await prisma.user.upsert({
        where: {
            hospitalId_email: {
                hospitalId: hospital.id,
                email: "admin@demo-hospital.local",
            },
        },
        update: {
            name: "System Administrator",
            role: "ADMIN",
            isActive: true,
        },
        create: {
            hospitalId: hospital.id,
            employeeId: "ADM001",
            name: "System Administrator",
            email: "admin@demo-hospital.local",
            passwordHash: adminPasswordHash,
            role: "ADMIN",
        },
    });

    // ==========================================================
    // 6. DOCTOR
    // ==========================================================

    const doctor = await prisma.user.upsert({
        where: {
            hospitalId_email: {
                hospitalId: hospital.id,
                email: "doctor@demo-hospital.local",
            },
        },
        update: {
            name: "Dr. Demo Doctor",
            role: "DOCTOR",
            isActive: true,
        },
        create: {
            hospitalId: hospital.id,
            employeeId: "DOC001",
            name: "Dr. Demo Doctor",
            email: "doctor@demo-hospital.local",
            passwordHash: doctorPasswordHash,
            role: "DOCTOR",
        },
    });

    // ==========================================================
    // 7. ICU
    // ==========================================================

    const icu = await prisma.iCU.upsert({
        where: {
            hospitalId_code: {
                hospitalId: hospital.id,
                code: "ICU-01",
            },
        },
        update: {
            name: "Main Intensive Care Unit",
            floor: "1",
            description: "Primary adult intensive care unit",
            isActive: true,
        },
        create: {
            hospitalId: hospital.id,
            name: "Main Intensive Care Unit",
            code: "ICU-01",
            floor: "1",
            description: "Primary adult intensive care unit",
        },
    });

    // ==========================================================
    // 8. BEDS
    // ==========================================================

    const bed1 = await prisma.bed.upsert({
        where: {
            icuId_bedNumber: {
                icuId: icu.id,
                bedNumber: "B01",
            },
        },
        update: {
            status: "OCCUPIED",
        },
        create: {
            icuId: icu.id,
            bedNumber: "B01",
            status: "OCCUPIED",
        },
    });

    await prisma.bed.upsert({
        where: {
            icuId_bedNumber: {
                icuId: icu.id,
                bedNumber: "B02",
            },
        },
        update: {
            status: "AVAILABLE",
        },
        create: {
            icuId: icu.id,
            bedNumber: "B02",
            status: "AVAILABLE",
        },
    });

    await prisma.bed.upsert({
        where: {
            icuId_bedNumber: {
                icuId: icu.id,
                bedNumber: "B03",
            },
        },
        update: {
            status: "AVAILABLE",
        },
        create: {
            icuId: icu.id,
            bedNumber: "B03",
            status: "AVAILABLE",
        },
    });

    // ==========================================================
    // 9. PATIENT
    // ==========================================================

    const patient = await prisma.patient.upsert({
        where: {
            hospitalId_patientNumber: {
                hospitalId: hospital.id,
                patientNumber: "P0001",
            },
        },
        update: {
            bedId: bed1.id,
            firstName: "Demo",
            lastName: "Patient",
            dateOfBirth: new Date("1985-05-15"),
            gender: "Male",
            bloodGroup: "O+",
            phone: "+91-9000000001",
            email: "demo.patient@example.local",
            address: "Pune, Maharashtra",
            emergencyContactName: "Demo Patient Family",
            emergencyContactPhone: "+91-9000000002",
            emergencyContactRelation: "Spouse",
            status: "ACTIVE",
            admissionReason:
                "Acute respiratory distress requiring intensive monitoring",
            currentCondition:
                "Hemodynamically stable under ICU observation",
        },
        create: {
            hospitalId: hospital.id,
            bedId: bed1.id,
            patientNumber: "P0001",
            firstName: "Demo",
            lastName: "Patient",
            dateOfBirth: new Date("1985-05-15"),
            gender: "Male",
            bloodGroup: "O+",
            phone: "+91-9000000001",
            email: "demo.patient@example.local",
            address: "Pune, Maharashtra",
            emergencyContactName: "Demo Patient Family",
            emergencyContactPhone: "+91-9000000002",
            emergencyContactRelation: "Spouse",
            status: "ACTIVE",
            admissionAt: new Date("2026-09-08T09:30:00"),
            admissionReason:
                "Acute respiratory distress requiring intensive monitoring",
            currentCondition:
                "Hemodynamically stable under ICU observation",
        },
    });

    // ==========================================================
    // 10. DOCTOR ↔ PATIENT ASSIGNMENT
    // ==========================================================

    const existingAssignment =
        await prisma.patientAssignment.findFirst({
            where: {
                patientId: patient.id,
                userId: doctor.id,
                unassignedAt: null,
            },
        });

    if (!existingAssignment) {
        await prisma.patientAssignment.create({
            data: {
                patientId: patient.id,
                userId: doctor.id,
            },
        });
    }

    // ==========================================================
    // 11. ADMISSION
    // ==========================================================

    const existingAdmission =
        await prisma.admission.findFirst({
            where: {
                patientId: patient.id,
                status: "CURRENT",
            },
        });

    if (!existingAdmission) {
        await prisma.admission.create({
            data: {
                patientId: patient.id,
                admittedAt: new Date("2026-09-08T09:30:00"),
                reason:
                    "Acute respiratory distress requiring intensive monitoring",
                status: "CURRENT",
                attendingDoctorId: doctor.id,
            },
        });
    }

    // ==========================================================
    // 12. DIAGNOSES
    // ==========================================================

    const diagnosis1 =
        await prisma.diagnosis.findFirst({
            where: {
                patientId: patient.id,
                diagnosis: "Acute respiratory distress",
            },
        });

    if (!diagnosis1) {
        await prisma.diagnosis.create({
            data: {
                patientId: patient.id,
                diagnosis: "Acute respiratory distress",
                type: "PRIMARY",
                diagnosedAt: new Date("2026-09-08T10:15:00"),
                notes:
                    "Primary ICU admission diagnosis requiring continuous respiratory and hemodynamic monitoring.",
                diagnosedById: doctor.id,
            },
        });
    }

    const diagnosis2 =
        await prisma.diagnosis.findFirst({
            where: {
                patientId: patient.id,
                diagnosis: "Community-acquired pneumonia",
            },
        });

    if (!diagnosis2) {
        await prisma.diagnosis.create({
            data: {
                patientId: patient.id,
                diagnosis: "Community-acquired pneumonia",
                type: "SECONDARY",
                diagnosedAt: new Date("2026-09-08T11:00:00"),
                notes:
                    "Suspected lower respiratory tract infection based on clinical presentation.",
                diagnosedById: doctor.id,
            },
        });
    }

    // ==========================================================
    // 13. MEDICAL HISTORY
    // ==========================================================

    const history1 =
        await prisma.medicalHistory.findFirst({
            where: {
                patientId: patient.id,
                condition: "Hypertension",
            },
        });

    if (!history1) {
        await prisma.medicalHistory.create({
            data: {
                patientId: patient.id,
                condition: "Hypertension",
                description:
                    "History of controlled hypertension.",
                diagnosedAt: new Date("2020-06-15"),
            },
        });
    }

    const history2 =
        await prisma.medicalHistory.findFirst({
            where: {
                patientId: patient.id,
                condition: "Type 2 Diabetes Mellitus",
            },
        });

    if (!history2) {
        await prisma.medicalHistory.create({
            data: {
                patientId: patient.id,
                condition: "Type 2 Diabetes Mellitus",
                description:
                    "Previously diagnosed type 2 diabetes under outpatient management.",
                diagnosedAt: new Date("2021-03-10"),
            },
        });
    }

    // ==========================================================
    // 14. ALLERGIES
    // ==========================================================

    const allergy =
        await prisma.allergy.findFirst({
            where: {
                patientId: patient.id,
                allergen: "Penicillin",
            },
        });

    if (!allergy) {
        await prisma.allergy.create({
            data: {
                patientId: patient.id,
                allergen: "Penicillin",
                reaction: "Skin rash",
                severity: "MODERATE",
                notes:
                    "Avoid penicillin-class antibiotics unless specifically reviewed by treating team.",
            },
        });
    }

    // ==========================================================
    // 15. MEDICATIONS
    // ==========================================================

    const medications = [
        {
            medicineName: "Ceftriaxone",
            dose: "1",
            unit: "g",
            route: "IV",
            frequency: "Every 12 hours",
            startDate: new Date("2026-09-08T12:00:00"),
            status: "ACTIVE" as const,
            instructions:
                "Administer as prescribed and monitor for adverse reactions.",
        },
        {
            medicineName: "Paracetamol",
            dose: "650",
            unit: "mg",
            route: "Oral",
            frequency: "Every 6 hours as needed",
            startDate: new Date("2026-09-08T12:00:00"),
            status: "ACTIVE" as const,
            instructions:
                "Use for fever or discomfort as clinically indicated.",
        },
        {
            medicineName: "Pantoprazole",
            dose: "40",
            unit: "mg",
            route: "IV",
            frequency: "Once daily",
            startDate: new Date("2026-09-08T12:00:00"),
            status: "ACTIVE" as const,
            instructions:
                "Administer before breakfast or according to ICU protocol.",
        },
        {
            medicineName: "Insulin",
            dose: "Sliding scale",
            unit: "units",
            route: "Subcutaneous",
            frequency: "As per glucose monitoring",
            startDate: new Date("2026-09-08T13:00:00"),
            status: "ACTIVE" as const,
            instructions:
                "Adjust according to bedside glucose measurements and clinical orders.",
        },
    ];

    for (const medication of medications) {
        const existingMedication =
            await prisma.medication.findFirst({
                where: {
                    patientId: patient.id,
                    medicineName: medication.medicineName,
                },
            });

        if (!existingMedication) {
            await prisma.medication.create({
                data: {
                    patientId: patient.id,
                    medicineName: medication.medicineName,
                    dose: medication.dose,
                    unit: medication.unit,
                    route: medication.route,
                    frequency: medication.frequency,
                    startDate: medication.startDate,
                    status: medication.status,
                    instructions: medication.instructions,
                    prescribedById: doctor.id,
                },
            });
        }
    }

    // ==========================================================
    // 16. LAB RESULTS
    // ==========================================================

    const labResults = [
        {
            testName: "Hemoglobin",
            result: "13.8",
            unit: "g/dL",
            referenceRange: "13.0 - 17.0 g/dL",
            performedAt: new Date("2026-09-10T06:30:00"),
            notes: "Within expected range.",
        },
        {
            testName: "White Blood Cell Count",
            result: "12.4",
            unit: "10³/µL",
            referenceRange: "4.0 - 11.0 10³/µL",
            performedAt: new Date("2026-09-10T06:30:00"),
            notes:
                "Mild elevation; correlate clinically.",
        },
        {
            testName: "Platelet Count",
            result: "245",
            unit: "10³/µL",
            referenceRange: "150 - 450 10³/µL",
            performedAt: new Date("2026-09-10T06:30:00"),
            notes: "Within expected range.",
        },
        {
            testName: "Creatinine",
            result: "1.1",
            unit: "mg/dL",
            referenceRange: "0.7 - 1.3 mg/dL",
            performedAt: new Date("2026-09-10T06:45:00"),
            notes: "Renal function currently stable.",
        },
        {
            testName: "Blood Glucose",
            result: "142",
            unit: "mg/dL",
            referenceRange: "70 - 140 mg/dL",
            performedAt: new Date("2026-09-10T07:00:00"),
            notes:
                "Slightly elevated; continue ICU glucose monitoring.",
        },
    ];

    for (const lab of labResults) {
        const existingLab =
            await prisma.labResult.findFirst({
                where: {
                    patientId: patient.id,
                    testName: lab.testName,
                    performedAt: lab.performedAt,
                },
            });

        if (!existingLab) {
            await prisma.labResult.create({
                data: {
                    patientId: patient.id,
                    testName: lab.testName,
                    result: lab.result,
                    unit: lab.unit,
                    referenceRange: lab.referenceRange,
                    performedAt: lab.performedAt,
                    notes: lab.notes,
                },
            });
        }
    }

    // ==========================================================
    // 17. PROCEDURES
    // ==========================================================

    const procedures = [
        {
            procedureName: "Arterial Blood Gas Analysis",
            performedAt: new Date("2026-09-08T14:00:00"),
            notes:
                "Performed for respiratory status assessment.",
        },
        {
            procedureName: "Chest X-Ray",
            performedAt: new Date("2026-09-08T15:30:00"),
            notes:
                "Portable chest imaging performed for respiratory evaluation.",
        },
    ];

    for (const procedure of procedures) {
        const existingProcedure =
            await prisma.procedure.findFirst({
                where: {
                    patientId: patient.id,
                    procedureName:
                        procedure.procedureName,
                },
            });

        if (!existingProcedure) {
            await prisma.procedure.create({
                data: {
                    patientId: patient.id,
                    procedureName:
                        procedure.procedureName,
                    performedAt:
                        procedure.performedAt,
                    notes: procedure.notes,
                    performedById: doctor.id,
                },
            });
        }
    }

    // ==========================================================
    // 18. CLINICAL NOTES
    // ==========================================================

    const clinicalNote =
        await prisma.clinicalNote.findFirst({
            where: {
                patientId: patient.id,
                note: {
                    contains:
                        "Patient remains hemodynamically stable",
                },
            },
        });

    if (!clinicalNote) {
        await prisma.clinicalNote.create({
            data: {
                patientId: patient.id,
                note:
                    "Patient remains hemodynamically stable under continuous ICU monitoring. Respiratory status is being monitored closely. Continue current treatment plan and review laboratory results as available.",
                authorId: doctor.id,
            },
        });
    }

    // ==========================================================
    // 19. REFERRAL
    // ==========================================================

    const referral =
        await prisma.referral.findFirst({
            where: {
                patientId: patient.id,
                referringDoctor: "Dr. Referral Physician",
            },
        });

    if (!referral) {
        await prisma.referral.create({
            data: {
                patientId: patient.id,
                referringDoctor: "Dr. Referral Physician",
                referringHospital:
                    "Demo City General Hospital",
                department: "Emergency Medicine",
                referralDate: new Date(
                    "2026-09-08T08:45:00",
                ),
                reason:
                    "Escalation of care for continuous ICU monitoring.",
                notes:
                    "Patient transferred to ICU Sentinel Demo Hospital for intensive monitoring and management.",
            },
        });
    }

    // ==========================================================
    // 20. PATIENT TIMELINE / EVENTS
    // ==========================================================

    const events = [
        {
            type: "ADMISSION" as const,
            title: "ICU Admission",
            description:
                "Patient admitted to Main Intensive Care Unit, Bed B01.",
            occurredAt: new Date("2026-09-08T09:30:00"),
        },
        {
            type: "DIAGNOSIS" as const,
            title: "Primary Diagnosis Recorded",
            description:
                "Acute respiratory distress recorded as the primary ICU diagnosis.",
            occurredAt: new Date("2026-09-08T10:15:00"),
        },
        {
            type: "PROCEDURE" as const,
            title: "Arterial Blood Gas Analysis",
            description:
                "ABG performed for respiratory status assessment.",
            occurredAt: new Date("2026-09-08T14:00:00"),
        },
        {
            type: "PROCEDURE" as const,
            title: "Chest X-Ray",
            description:
                "Portable chest X-ray performed.",
            occurredAt: new Date("2026-09-08T15:30:00"),
        },
        {
            type: "MEDICATION" as const,
            title: "Medication Plan Initiated",
            description:
                "Initial ICU medication regimen initiated.",
            occurredAt: new Date("2026-09-08T12:00:00"),
        },
        {
            type: "LAB" as const,
            title: "Morning Laboratory Panel",
            description:
                "Routine ICU laboratory investigations completed.",
            occurredAt: new Date("2026-09-10T07:00:00"),
        },
        {
            type: "NOTE" as const,
            title: "Clinical Progress Note",
            description:
                "Patient remains hemodynamically stable under continuous monitoring.",
            occurredAt: new Date("2026-09-10T09:00:00"),
        },
    ];

    for (const event of events) {
        const existingEvent =
            await prisma.patientEvent.findFirst({
                where: {
                    patientId: patient.id,
                    title: event.title,
                },
            });

        if (!existingEvent) {
            await prisma.patientEvent.create({
                data: {
                    patientId: patient.id,
                    type: event.type,
                    title: event.title,
                    description: event.description,
                    occurredAt: event.occurredAt,
                    createdById: doctor.id,
                },
            });
        }
    }

    // ==========================================================
    // 21. ALERT RULES
    // ==========================================================

    const alertRules = [
        {
            name: "Low Heart Rate",
            vitalType: "HEART_RATE",
            minValue: 50,
            maxValue: null,
            severity: "WARNING" as const,
            durationSeconds: 0,
        },
        {
            name: "High Heart Rate",
            vitalType: "HEART_RATE",
            minValue: null,
            maxValue: 120,
            severity: "WARNING" as const,
            durationSeconds: 0,
        },
        {
            name: "Low Oxygen Saturation",
            vitalType: "SPO2",
            minValue: 92,
            maxValue: null,
            severity: "CRITICAL" as const,
            durationSeconds: 0,
        },
        {
            name: "High Temperature",
            vitalType: "TEMPERATURE",
            minValue: null,
            maxValue: 38,
            severity: "WARNING" as const,
            durationSeconds: 0,
        },
        {
            name: "Low Systolic Blood Pressure",
            vitalType: "SYSTOLIC_BP",
            minValue: 90,
            maxValue: null,
            severity: "CRITICAL" as const,
            durationSeconds: 0,
        },
        {
            name: "High Respiratory Rate",
            vitalType: "RESPIRATORY_RATE",
            minValue: null,
            maxValue: 25,
            severity: "WARNING" as const,
            durationSeconds: 0,
        },
        {
            name: "High Glucose",
            vitalType: "GLUCOSE",
            minValue: null,
            maxValue: 180,
            severity: "WARNING" as const,
            durationSeconds: 0,
        },
    ];

    for (const rule of alertRules) {
        const existingRule =
            await prisma.alertRule.findFirst({
                where: {
                    hospitalId: hospital.id,
                    name: rule.name,
                },
            });

        if (existingRule) {
            await prisma.alertRule.update({
                where: {
                    id: existingRule.id,
                },
                data: {
                    vitalType: rule.vitalType,
                    minValue: rule.minValue,
                    maxValue: rule.maxValue,
                    severity: rule.severity,
                    durationSeconds:
                        rule.durationSeconds,
                    isActive: true,
                },
            });
        } else {
            await prisma.alertRule.create({
                data: {
                    hospitalId: hospital.id,
                    name: rule.name,
                    vitalType: rule.vitalType,
                    minValue: rule.minValue,
                    maxValue: rule.maxValue,
                    severity: rule.severity,
                    durationSeconds:
                        rule.durationSeconds,
                    isActive: true,
                },
            });
        }
    }

    // ==========================================================

    // 22. INTEGRATION CONFIG
    // ==========================================================

    const existingIntegration =
        await prisma.integrationConfig.findFirst({
            where: {
                hospitalId: hospital.id,
                name: "ICU Simulator",
            },
        });

    if (!existingIntegration) {
        await prisma.integrationConfig.create({
            data: {
                hospitalId: hospital.id,
                name: "ICU Simulator",
                type: "SIMULATOR",
                status: "ACTIVE",
                endpoint: "http://localhost:3001",
                facilityCode: "DEMO-ICU",
            },
        });
    }

    // ==========================================================
    // RESULT
    // ==========================================================

    console.log("");
    console.log("✅ ICU Sentinel seed completed!");
    console.log("");

    console.log("Hospital:");
    console.log(`  ${hospital.name}`);

    console.log("");
    console.log("Admin:");
    console.log("  Email: admin@demo-hospital.local");
    console.log("  Password: Admin@123");

    console.log("");
    console.log("Doctor:");
    console.log("  Email: doctor@demo-hospital.local");
    console.log("  Password: Doctor@123");

    console.log("");
    console.log(`ICU: ${icu.name}`);
    console.log(`Bed: B01`);
    console.log(
        `Patient: ${patient.firstName} ${patient.lastName}`,
    );
    console.log(`Patient Number: ${patient.patientNumber}`);
    console.log(`Patient ID: ${patient.id}`);

    console.log("");
    console.log("Clinical demo data:");
    console.log("  ✓ Admission");
    console.log("  ✓ Diagnoses");
    console.log("  ✓ Medical history");
    console.log("  ✓ Allergies");
    console.log("  ✓ Medications");
    console.log("  ✓ Lab results");
    console.log("  ✓ Procedures");
    console.log("  ✓ Clinical notes");
    console.log("  ✓ Referral");
    console.log("  ✓ Patient timeline");

    console.log("");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
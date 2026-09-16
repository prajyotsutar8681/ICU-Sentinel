-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('CURRENT', 'DISCHARGED', 'TRANSFERRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISCONTINUED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "DiagnosisType" AS ENUM ('PRIMARY', 'SECONDARY', 'PROVISIONAL', 'HISTORICAL');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PatientEventType" AS ENUM ('ADMISSION', 'TRANSFER', 'DIAGNOSIS', 'MEDICATION', 'PROCEDURE', 'LAB', 'ALERT', 'NOTE', 'DISCHARGE', 'OTHER');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "admissionReason" TEXT,
ADD COLUMN     "currentCondition" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Admission" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "admittedAt" TIMESTAMP(3) NOT NULL,
    "dischargedAt" TIMESTAMP(3),
    "reason" TEXT,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'CURRENT',
    "attendingDoctorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "type" "DiagnosisType" NOT NULL DEFAULT 'SECONDARY',
    "diagnosedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "diagnosedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "condition" TEXT NOT NULL,
    "description" TEXT,
    "diagnosedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" "AllergySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dose" TEXT,
    "unit" TEXT,
    "route" TEXT,
    "frequency" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "MedicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "instructions" TEXT,
    "prescribedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "testName" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "unit" TEXT,
    "referenceRange" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "procedureName" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "performedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" UUID,

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "referringDoctor" TEXT,
    "referringHospital" TEXT,
    "department" TEXT,
    "referralDate" TIMESTAMP(3),
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientEvent" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "type" "PatientEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Admission_patientId_admittedAt_idx" ON "Admission"("patientId", "admittedAt");

-- CreateIndex
CREATE INDEX "Admission_patientId_status_idx" ON "Admission"("patientId", "status");

-- CreateIndex
CREATE INDEX "Diagnosis_patientId_diagnosedAt_idx" ON "Diagnosis"("patientId", "diagnosedAt");

-- CreateIndex
CREATE INDEX "Diagnosis_patientId_type_idx" ON "Diagnosis"("patientId", "type");

-- CreateIndex
CREATE INDEX "MedicalHistory_patientId_idx" ON "MedicalHistory"("patientId");

-- CreateIndex
CREATE INDEX "Allergy_patientId_idx" ON "Allergy"("patientId");

-- CreateIndex
CREATE INDEX "Medication_patientId_status_idx" ON "Medication"("patientId", "status");

-- CreateIndex
CREATE INDEX "Medication_patientId_startDate_idx" ON "Medication"("patientId", "startDate");

-- CreateIndex
CREATE INDEX "LabResult_patientId_performedAt_idx" ON "LabResult"("patientId", "performedAt");

-- CreateIndex
CREATE INDEX "Procedure_patientId_performedAt_idx" ON "Procedure"("patientId", "performedAt");

-- CreateIndex
CREATE INDEX "ClinicalNote_patientId_createdAt_idx" ON "ClinicalNote"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "Referral_patientId_referralDate_idx" ON "Referral"("patientId", "referralDate");

-- CreateIndex
CREATE INDEX "PatientEvent_patientId_occurredAt_idx" ON "PatientEvent"("patientId", "occurredAt");

-- CreateIndex
CREATE INDEX "PatientEvent_patientId_type_idx" ON "PatientEvent"("patientId", "type");

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_attendingDoctorId_fkey" FOREIGN KEY ("attendingDoctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_diagnosedById_fkey" FOREIGN KEY ("diagnosedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientEvent" ADD CONSTRAINT "PatientEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientEvent" ADD CONSTRAINT "PatientEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

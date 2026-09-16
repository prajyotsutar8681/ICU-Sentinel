import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type VitalInput = {
    heartRate?: number | null;
    systolicBP?: number | null;
    diastolicBP?: number | null;
    spo2?: number | null;
    temperature?: number | null;
    respiratoryRate?: number | null;
    glucose?: number | null;
};

@Injectable()
export class AlertService {
    constructor(private readonly prisma: PrismaService) { }

    async evaluateVital(
        patientId: string,
        vital: VitalInput,
    ) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                hospitalId: true,
            },
        });

        if (!patient) {
            return [];
        }

        const rules = await this.prisma.alertRule.findMany({
            where: {
                hospitalId: patient.hospitalId,
                isActive: true,
            },
        });

        const createdAlerts = [];

        for (const rule of rules) {
            const value = this.getVitalValue(
                vital,
                rule.vitalType,
            );

            if (value === null) {
                continue;
            }

            const exceededMin =
                rule.minValue !== null &&
                value < rule.minValue;

            const exceededMax =
                rule.maxValue !== null &&
                value > rule.maxValue;

            if (!exceededMin && !exceededMax) {
                continue;
            }

            /*
             * Prevent duplicate ACTIVE alerts for the same
             * patient/rule. A new alert is generated only after
             * the previous one is no longer ACTIVE.
             */
            const existingAlert =
                await this.prisma.alert.findFirst({
                    where: {
                        patientId,
                        ruleId: rule.id,
                        status: 'ACTIVE',
                    },
                    orderBy: {
                        generatedAt: 'desc',
                    },
                });

            if (existingAlert) {
                continue;
            }

            const thresholdValue = exceededMin
                ? rule.minValue
                : rule.maxValue;

            const direction = exceededMin
                ? 'below'
                : 'above';

            const alert = await this.prisma.alert.create({
                data: {
                    patientId,
                    ruleId: rule.id,
                    severity: rule.severity,
                    status: 'ACTIVE',
                    vitalType: rule.vitalType,
                    message: `${rule.name}: ${rule.vitalType} is ${direction} the configured threshold`,
                    triggeredValue: value,
                    thresholdValue,
                },
            });

            createdAlerts.push(alert);
        }

        return createdAlerts;
    }

    private getVitalValue(
        vital: VitalInput,
        vitalType: string,
    ): number | null {
        const values: Record<
            string,
            number | null | undefined
        > = {
            HEART_RATE: vital.heartRate,
            heartRate: vital.heartRate,

            SYSTOLIC_BP: vital.systolicBP,
            systolicBP: vital.systolicBP,

            DIASTOLIC_BP: vital.diastolicBP,
            diastolicBP: vital.diastolicBP,

            SPO2: vital.spo2,
            spo2: vital.spo2,

            TEMPERATURE: vital.temperature,
            temperature: vital.temperature,

            RESPIRATORY_RATE:
                vital.respiratoryRate,
            respiratoryRate:
                vital.respiratoryRate,

            GLUCOSE: vital.glucose,
            glucose: vital.glucose,
        };

        const value = values[vitalType];

        return typeof value === 'number' &&
            Number.isFinite(value)
            ? value
            : null;
    }
}
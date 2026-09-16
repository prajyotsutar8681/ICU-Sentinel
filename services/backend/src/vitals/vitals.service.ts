import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { VitalsGateway } from './vitals.gateway.js';
import { AlertService } from '../alert/alert.service.js';

@Injectable()
export class VitalsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly vitalsGateway: VitalsGateway,
        private readonly alertService: AlertService,
    ) { }

    async getLatest(patientId: string) {
        return this.prisma.vital.findFirst({
            where: { patientId },
            orderBy: { recordedAt: 'desc' },
        });
    }

    async getHistory(
        patientId: string,
        limit = 100,
        hours = 24,
    ) {
        if (!Number.isFinite(hours) || hours <= 0) {
            hours = 24;
        }

        hours = Math.min(hours, 168);

        const since = new Date(
            Date.now() - hours * 60 * 60 * 1000,
        );

        return this.prisma.vital.findMany({
            where: {
                patientId,
                recordedAt: {
                    gte: since,
                },
            },
            orderBy: {
                recordedAt: 'desc',
            },
            take: Math.min(limit, 500),
        });
    }

    async create(
        patientId: string,
        data: {
            heartRate?: number;
            systolicBP?: number;
            diastolicBP?: number;
            spo2?: number;
            temperature?: number;
            respiratoryRate?: number;
            glucose?: number;
            recordedAt?: string;
            source?: string;
            sourceDevice?: string;
        },
    ) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            select: { id: true },
        });

        if (!patient) {
            throw new BadRequestException('Patient not found');
        }

        const vital = await this.prisma.vital.create({
            data: {
                patientId,
                heartRate: data.heartRate,
                systolicBP: data.systolicBP,
                diastolicBP: data.diastolicBP,
                spo2: data.spo2,
                temperature: data.temperature,
                respiratoryRate: data.respiratoryRate,
                glucose: data.glucose,
                recordedAt: data.recordedAt
                    ? new Date(data.recordedAt)
                    : new Date(),
                source: data.source,
                sourceDevice: data.sourceDevice,
            },
        });

        this.vitalsGateway.emitVitalUpdate(
            patientId,
            vital,
        );

        /*
         * Evaluate the newly received vital against the
         * hospital's active alert rules.
         */
        const alerts = await this.alertService.evaluateVital(
            patientId,
            vital,
        );

        for (const alert of alerts) {
            this.vitalsGateway.emitAlert(
                patientId,
                alert,
            );
        }

        return vital;
    }

    async getLatestForPatients(
        patientIds: string[],
    ) {
        const vitals =
            await this.prisma.vital.findMany({
                where: {
                    patientId: {
                        in: patientIds,
                    },
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            });

        const latest = new Map<
            string,
            (typeof vitals)[number]
        >();

        for (const vital of vitals) {
            if (!latest.has(vital.patientId)) {
                latest.set(
                    vital.patientId,
                    vital,
                );
            }
        }

        return latest;
    }
}
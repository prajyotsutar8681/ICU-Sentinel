import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AlertService } from '../alert/alert.service.js';
import { VitalsGateway } from '../vitals/vitals.gateway.js';

@Injectable()
export class DemoSimulatorService implements OnModuleInit {
    private interval?: NodeJS.Timeout;
    private tick = 0;

    constructor(
        private readonly prisma: PrismaService,
        private readonly alertService: AlertService,
        private readonly vitalsGateway: VitalsGateway,
    ) { }

    async onModuleInit() {
        console.log('🩺 ICU Sentinel Demo Simulator started');

        await this.generateVital();

        this.interval = setInterval(() => {
            void this.generateVital();
        }, 5000);
    }

    private async generateVital() {
        try {
            const patient = await this.prisma.patient.findFirst({
                where: {
                    patientNumber: 'P0001',
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                },
            });

            if (!patient) {
                console.log('⚠️ Demo patient P0001 not found');
                return;
            }

            this.tick++;

            // Every 12th reading (~60 seconds), generate an abnormal reading.
            const abnormal = this.tick % 12 === 0;
            const vital = await this.prisma.vital.create({
                data: abnormal
                    ? {
                        patientId: patient.id,
                        heartRate: 135,
                        systolicBP: 120,
                        diastolicBP: 75,
                        spo2: 88,
                        temperature: 39.2,
                        respiratoryRate: 30,
                        glucose: 110,
                        recordedAt: new Date(),
                        source: 'DEMO_SIMULATOR',
                        sourceDevice: 'ICU-DEMO-MONITOR-01',
                    }
                    : {
                        patientId: patient.id,
                        heartRate: Math.round(75 + Math.random() * 15),
                        systolicBP: Math.round(115 + Math.random() * 15),
                        diastolicBP: Math.round(68 + Math.random() * 12),
                        spo2: Math.round(97 + Math.random() * 3),
                        temperature: Number(
                            (36.5 + Math.random() * 0.6).toFixed(1),
                        ),
                        respiratoryRate: Math.round(15 + Math.random() * 5),
                        glucose: Math.round(95 + Math.random() * 25),
                        recordedAt: new Date(),
                        source: 'DEMO_SIMULATOR',
                        sourceDevice: 'ICU-DEMO-MONITOR-01',
                    },
            });

            this.vitalsGateway.emitVitalUpdate(patient.id, vital);

            const alerts = await this.alertService.evaluateVital(
                patient.id,
                vital,
            );

            for (const alert of alerts) {
                this.vitalsGateway.emitAlert(patient.id, alert);
            }

            console.log(
                `🩺 Demo Vital | HR ${vital.heartRate} | SpO₂ ${vital.spo2} | BP ${vital.systolicBP}/${vital.diastolicBP} | Temp ${vital.temperature}`,
            );

            if (alerts.length > 0) {
                console.log(`🚨 Demo generated ${alerts.length} alert(s)`);
            }
        } catch (error) {
            console.error('❌ Demo simulator error:', error);
        }
    }
}
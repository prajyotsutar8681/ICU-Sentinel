import 'dotenv/config';

import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class SimulatorService
    implements OnModuleInit, OnModuleDestroy {
    private interval?: NodeJS.Timeout;

    private isSending = false;

    private readonly backendUrl =
        process.env.BACKEND_URL ??
        'http://localhost:3000';

    private readonly patientId =
        process.env.PATIENT_ID;

    private readonly intervalMs =
        Number(process.env.INTERVAL_MS ?? 5000);

    /*
     * Maximum time allowed for one backend request.
     * If the backend hangs, the simulator will not
     * remain stuck forever.
     */
    private readonly requestTimeoutMs = 4000;

    // ==========================================================
    // START SIMULATOR
    // ==========================================================

    async onModuleInit() {
        if (!this.patientId) {
            throw new Error(
                'PATIENT_ID is not defined',
            );
        }

        if (
            !Number.isFinite(this.intervalMs) ||
            this.intervalMs <= 0
        ) {
            throw new Error(
                'INTERVAL_MS must be a positive number',
            );
        }

        console.log('');
        console.log('🏥 ICU Simulator started');
        console.log(
            `Patient: ${this.patientId}`,
        );
        console.log(
            `Backend: ${this.backendUrl}`,
        );
        console.log(
            `Interval: ${this.intervalMs}ms`,
        );
        console.log(
            `Request timeout: ${this.requestTimeoutMs}ms`,
        );
        console.log('');

        /*
         * Send the first reading immediately.
         */
        await this.sendVitals();

        /*
         * Continue generating vitals every interval.
         */
        this.interval = setInterval(() => {
            void this.runSimulationCycle();
        }, this.intervalMs);
    }

    // ==========================================================
    // SIMULATION CYCLE
    // ==========================================================

    private async runSimulationCycle() {
        /*
         * Prevent overlapping requests.
         *
         * If a previous backend request is still running,
         * skip this cycle instead of creating another request.
         */
        if (this.isSending) {
            console.warn(
                '⚠️ Previous vital request is still running. Skipping cycle.',
            );

            return;
        }

        await this.sendVitals();
    }

    // ==========================================================
    // STOP SIMULATOR
    // ==========================================================

    async onModuleDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        console.log(
            '🛑 ICU Simulator stopped',
        );
    }

    // ==========================================================
    // RANDOM VALUE
    // ==========================================================

    private randomBetween(
        min: number,
        max: number,
    ): number {
        return (
            Math.round(
                (
                    Math.random() *
                    (max - min) +
                    min
                ) * 10,
            ) / 10
        );
    }

    // ==========================================================
    // GENERATE + SEND VITALS
    // ==========================================================

    private async sendVitals() {
        if (this.isSending) {
            return;
        }

        this.isSending = true;

        /*
         * Generate a new vital reading.
         */
        const vitals = {
            heartRate: Math.round(
                this.randomBetween(70, 95),
            ),

            systolicBP: Math.round(
                this.randomBetween(110, 130),
            ),

            diastolicBP: Math.round(
                this.randomBetween(65, 85),
            ),

            spo2: Math.round(
                this.randomBetween(95, 100),
            ),

            temperature:
                this.randomBetween(
                    36.3,
                    37.2,
                ),

            respiratoryRate: Math.round(
                this.randomBetween(14, 20),
            ),

            glucose: Math.round(
                this.randomBetween(90, 120),
            ),

            source: 'SIMULATOR',

            sourceDevice:
                'ICU-MONITOR-01',
        };

        /*
         * IMPORTANT:
         * Print the generated values BEFORE calling
         * the backend.
         *
         * This lets us immediately know whether the
         * simulator itself is generating values.
         */
        console.log(
            `💓 HR ${vitals.heartRate} | ` +
            `SpO₂ ${vitals.spo2}% | ` +
            `BP ${vitals.systolicBP}/${vitals.diastolicBP} | ` +
            `Temp ${vitals.temperature}°C`,
        );

        const controller =
            new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, this.requestTimeoutMs);

        try {
            const response =
                await fetch(
                    `${this.backendUrl}/vitals/patient/${this.patientId}`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',
                        },

                        body: JSON.stringify(
                            vitals,
                        ),

                        signal:
                            controller.signal,
                    },
                );

            if (!response.ok) {
                const errorText =
                    await response.text();

                console.error(
                    `❌ Backend returned ${response.status}: ${errorText}`,
                );

                return;
            }

            console.log(
                '   ✅ Vital sent to backend',
            );
        } catch (error) {
            if (
                error instanceof Error &&
                error.name === 'AbortError'
            ) {
                console.error(
                    `⏱️ Backend request timed out after ${this.requestTimeoutMs}ms`,
                );
            } else {
                console.error(
                    '❌ Could not connect to backend:',
                    error,
                );
            }
        } finally {
            clearTimeout(timeout);

            this.isSending = false;
        }
    }
}
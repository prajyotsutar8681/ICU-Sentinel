import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class IcuService {
    constructor(private readonly prisma: PrismaService) { }

    async findByHospital(hospitalId: string) {
        return this.prisma.iCU.findMany({
            where: {
                hospitalId,
                isActive: true,
            },
            include: {
                beds: {
                    select: {
                        id: true,
                        bedNumber: true,
                        status: true,
                        patients: {
                            where: {
                                status: 'ACTIVE',
                            },
                            select: {
                                id: true,
                                patientNumber: true,
                                firstName: true,
                                lastName: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: {
                        bedNumber: 'asc',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async getOverview(icuId: string) {
        const icu = await this.prisma.iCU.findUnique({
            where: {
                id: icuId,
            },
            include: {
                beds: {
                    include: {
                        patients: {
                            where: {
                                status: 'ACTIVE',
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                    },
                    orderBy: {
                        bedNumber: 'asc',
                    },
                },
            },
        });

        if (!icu) {
            throw new BadRequestException('ICU not found');
        }

        const patientIds = icu.beds.flatMap((bed) =>
            bed.patients.map((patient) => patient.id),
        );

        const vitals = patientIds.length
            ? await this.prisma.vital.findMany({
                where: {
                    patientId: {
                        in: patientIds,
                    },
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            })
            : [];

        const latestVitals = new Map<
            string,
            (typeof vitals)[number]
        >();

        for (const vital of vitals) {
            if (!latestVitals.has(vital.patientId)) {
                latestVitals.set(vital.patientId, vital);
            }
        }

        return {
            id: icu.id,
            name: icu.name,
            code: icu.code,

            beds: icu.beds.map((bed) => {
                const patient = bed.patients[0] ?? null;

                return {
                    id: bed.id,
                    bedNumber: bed.bedNumber,
                    status: bed.status,

                    patient: patient
                        ? {
                            id: patient.id,
                            patientNumber:
                                patient.patientNumber,
                            firstName: patient.firstName,
                            lastName: patient.lastName,
                            status: patient.status,

                            latestVital:
                                latestVitals.get(patient.id) ??
                                null,
                        }
                        : null,
                };
            }),
        };
    }
}
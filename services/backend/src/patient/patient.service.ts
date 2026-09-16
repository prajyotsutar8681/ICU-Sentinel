import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PatientService {
    constructor(private readonly prisma: PrismaService) { }

    // ==========================================================
    // GET ALL ACTIVE PATIENTS FOR A HOSPITAL
    // ==========================================================

    async findByHospital(hospitalId: string) {
        return this.prisma.patient.findMany({
            where: {
                hospitalId,
                status: 'ACTIVE',
            },
            include: {
                bed: {
                    select: {
                        id: true,
                        bedNumber: true,
                        status: true,
                        icu: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                floor: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                admissionAt: 'desc',
            },
        });
    }

    // ==========================================================
    // GET COMPLETE PATIENT DETAIL
    // ==========================================================

    async findOne(patientId: string) {
        const patient =
            await this.prisma.patient.findUnique({
                where: {
                    id: patientId,
                },
                include: {
                    // --------------------------------------------------
                    // HOSPITAL
                    // --------------------------------------------------

                    hospital: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            city: true,
                            state: true,
                            country: true,
                        },
                    },

                    // --------------------------------------------------
                    // BED + ICU
                    // --------------------------------------------------

                    bed: {
                        select: {
                            id: true,
                            bedNumber: true,
                            status: true,
                            icu: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    floor: true,
                                    description: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // PATIENT ASSIGNMENTS / CARE TEAM
                    // --------------------------------------------------

                    assignments: {
                        where: {
                            unassignedAt: null,
                        },
                        orderBy: {
                            assignedAt: 'desc',
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // ADMISSIONS
                    // --------------------------------------------------

                    admissions: {
                        orderBy: {
                            admittedAt: 'desc',
                        },
                        include: {
                            attendingDoctor: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // DIAGNOSES
                    // --------------------------------------------------

                    diagnoses: {
                        orderBy: {
                            diagnosedAt: 'desc',
                        },
                        include: {
                            diagnosedBy: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // MEDICAL HISTORY
                    // --------------------------------------------------

                    medicalHistories: {
                        orderBy: {
                            diagnosedAt: 'desc',
                        },
                    },

                    // --------------------------------------------------
                    // ALLERGIES
                    // --------------------------------------------------

                    allergies: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },

                    // --------------------------------------------------
                    // MEDICATIONS
                    // --------------------------------------------------

                    medications: {
                        orderBy: {
                            startDate: 'desc',
                        },
                        include: {
                            prescribedBy: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // LAB RESULTS
                    // --------------------------------------------------

                    labResults: {
                        orderBy: {
                            performedAt: 'desc',
                        },
                    },

                    // --------------------------------------------------
                    // PROCEDURES
                    // --------------------------------------------------

                    procedures: {
                        orderBy: {
                            performedAt: 'desc',
                        },
                        include: {
                            performedBy: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // CLINICAL NOTES
                    // --------------------------------------------------

                    clinicalNotes: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // REFERRALS
                    // --------------------------------------------------

                    referrals: {
                        orderBy: {
                            referralDate: 'desc',
                        },
                    },

                    // --------------------------------------------------
                    // PATIENT TIMELINE / EVENTS
                    // --------------------------------------------------

                    events: {
                        orderBy: {
                            occurredAt: 'desc',
                        },
                        include: {
                            createdBy: {
                                select: {
                                    id: true,
                                    employeeId: true,
                                    name: true,
                                    role: true,
                                },
                            },
                        },
                    },

                    // --------------------------------------------------
                    // LATEST VITAL
                    // --------------------------------------------------

                    vitals: {
                        orderBy: {
                            recordedAt: 'desc',
                        },
                        take: 1,
                    },
                },
            });

        // ----------------------------------------------------------
        // PATIENT NOT FOUND
        // ----------------------------------------------------------

        if (!patient) {
            throw new NotFoundException(
                'Patient not found',
            );
        }

        // ----------------------------------------------------------
        // CONVERT LATEST VITAL ARRAY INTO SINGLE OBJECT
        // ----------------------------------------------------------

        const latestVital = patient.vitals[0] ?? null;

        const {
            vitals,
            ...patientData
        } = patient;

        return {
            ...patientData,
            latestVital,
        };
    }
}
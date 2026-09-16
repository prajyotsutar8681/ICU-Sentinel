import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HospitalService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.hospital.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                country: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
}
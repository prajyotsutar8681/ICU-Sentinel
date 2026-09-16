import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { VitalsService } from './vitals.service.js';

@Controller('vitals')
export class VitalsController {
    constructor(private readonly vitalsService: VitalsService) { }

    @Get('patient/:patientId/latest')
    getLatest(@Param('patientId') patientId: string) {
        return this.vitalsService.getLatest(patientId);
    }

    @Get('patient/:patientId/history')
    getHistory(
        @Param('patientId') patientId: string,
        @Query('limit') limit?: string,
        @Query('hours') hours?: string,
    ) {
        const parsedLimit = limit
            ? Number.parseInt(limit, 10)
            : 100;

        const parsedHours = hours
            ? Number.parseFloat(hours)
            : 24;

        return this.vitalsService.getHistory(
            patientId,
            Number.isNaN(parsedLimit) ? 100 : parsedLimit,
            Number.isNaN(parsedHours) ? 24 : parsedHours,
        );
    }

    @Post('patient/:patientId')
    create(
        @Param('patientId') patientId: string,
        @Body()
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
        return this.vitalsService.create(patientId, data);
    }
}
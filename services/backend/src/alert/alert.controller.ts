import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
} from '@nestjs/common';

import { AlertService } from './alert.service.js';

@Controller('alerts')
export class AlertController {
    constructor(
        private readonly alertService: AlertService,
    ) { }

    @Get('patient/:patientId')
    getPatientAlerts(
        @Param('patientId') patientId: string,
    ) {
        return this.alertService.getPatientAlerts(
            patientId,
        );
    }

    @Post(':alertId/acknowledge')
    acknowledge(
        @Param('alertId') alertId: string,
        @Body() body: { userId?: string },
    ) {
        if (!body.userId) {
            throw new BadRequestException(
                'userId is required',
            );
        }

        return this.alertService.acknowledge(
            alertId,
            body.userId,
        );
    }

    @Post(':alertId/resolve')
    resolve(
        @Param('alertId') alertId: string,
        @Body() body: { userId?: string },
    ) {
        if (!body.userId) {
            throw new BadRequestException(
                'userId is required',
            );
        }

        return this.alertService.resolve(
            alertId,
            body.userId,
        );
    }
}
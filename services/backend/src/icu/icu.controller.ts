import { Controller, Get, Param } from '@nestjs/common';
import { IcuService } from './icu.service.js';

@Controller('icus')
export class IcuController {
    constructor(private readonly icuService: IcuService) { }

    @Get('hospital/:hospitalId')
    findByHospital(
        @Param('hospitalId') hospitalId: string,
    ) {
        return this.icuService.findByHospital(hospitalId);
    }

    @Get(':icuId/overview')
    getOverview(
        @Param('icuId') icuId: string,
    ) {
        return this.icuService.getOverview(icuId);
    }
}
import { Controller, Get } from '@nestjs/common';
import { HospitalService } from './hospital.service.js';

@Controller('hospitals')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) { }

    @Get()
    findAll() {
        return this.hospitalService.findAll();
    }
}
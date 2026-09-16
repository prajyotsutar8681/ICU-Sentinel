import { Controller, Get, Param } from '@nestjs/common';
import { PatientService } from './patient.service.js';

@Controller('hospitals/:hospitalId/patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) { }

    @Get()
    findByHospital(@Param('hospitalId') hospitalId: string) {
        return this.patientService.findByHospital(hospitalId);
    }

    @Get(':patientId')
    findOne(@Param('patientId') patientId: string) {
        return this.patientService.findOne(patientId);
    }
}
import { Module } from '@nestjs/common';
import { PatientModule } from './patient/patient.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HospitalModule } from './hospital/hospital.module.js';
import { IcuModule } from './icu/icu.module.js';
import { VitalsModule } from './vitals/vitals.module.js';
import { AlertModule } from './alert/alert.module.js';
@Module({
  imports: [
    PrismaModule,
    HospitalModule,
    IcuModule,
    PatientModule,
    VitalsModule,
    AlertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
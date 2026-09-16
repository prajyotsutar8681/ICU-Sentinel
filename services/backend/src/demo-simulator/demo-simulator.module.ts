import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AlertModule } from '../alert/alert.module.js';
import { VitalsModule } from '../vitals/vitals.module.js';
import { DemoSimulatorService } from './demo-simulator.service.js';

@Module({
    imports: [
        PrismaModule,
        AlertModule,
        VitalsModule,
    ],
    providers: [DemoSimulatorService],
})
export class DemoSimulatorModule { }
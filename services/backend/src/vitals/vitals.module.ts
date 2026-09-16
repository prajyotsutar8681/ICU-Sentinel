import { Module } from '@nestjs/common';
import { AlertModule } from '../alert/alert.module.js';
import { VitalsController } from './vitals.controller.js';
import { VitalsGateway } from './vitals.gateway.js';
import { VitalsService } from './vitals.service.js';

@Module({
    imports: [AlertModule],
    controllers: [VitalsController],
    providers: [
        VitalsService,
        VitalsGateway,
    ],
    exports: [VitalsService],
})
export class VitalsModule { }
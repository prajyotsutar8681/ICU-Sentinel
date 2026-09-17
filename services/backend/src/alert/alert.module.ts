import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AlertController } from './alert.controller.js';
import { AlertService } from './alert.service.js';

@Module({
    imports: [PrismaModule],
    controllers: [AlertController],
    providers: [AlertService],
    exports: [AlertService],
})
export class AlertModule { }
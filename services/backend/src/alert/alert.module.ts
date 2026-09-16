import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AlertService } from './alert.service.js';

@Module({
    imports: [PrismaModule],
    providers: [AlertService],
    exports: [AlertService],
})
export class AlertModule { }
import { Module } from '@nestjs/common';
import { IcuController } from './icu.controller.js';
import { IcuService } from './icu.service.js';

@Module({
    controllers: [IcuController],
    providers: [IcuService],
})
export class IcuModule { }
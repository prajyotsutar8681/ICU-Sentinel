import { Module } from '@nestjs/common';
import { SimulatorService } from './simulator.service.js';

@Module({
  providers: [SimulatorService],
})
export class AppModule { }
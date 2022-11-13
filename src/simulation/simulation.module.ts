import { Module } from '@nestjs/common';
import { TestCmd } from './test';

@Module({
  imports: [],
  controllers: [],
  providers: [TestCmd],
})
export class SimulationModule {}

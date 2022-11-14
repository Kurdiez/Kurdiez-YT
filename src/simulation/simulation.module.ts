import { Module } from '@nestjs/common';
import { MonthlyIncomeFunds } from './investing/monthlyIncomeFunds';
import { TestCmd } from './test.cmd';

@Module({
  imports: [],
  controllers: [],
  providers: [TestCmd, MonthlyIncomeFunds],
})
export class SimulationModule {}

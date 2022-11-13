import { Module } from '@nestjs/common';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [SimulationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

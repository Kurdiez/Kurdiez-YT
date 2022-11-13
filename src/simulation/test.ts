import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'test',
  description: 'A prototype for data export pipeline idea',
})
export class TestCmd extends CommandRunner {
  async run(_passedParams: string[]): Promise<void> {
    console.log('=== test run() entered');
  }
}

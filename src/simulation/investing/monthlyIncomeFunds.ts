import { Command, CommandRunner, Option } from 'nest-commander';
import BigNumber from 'bignumber.js';
import * as ObjectsToCsv from 'objects-to-csv';
import { join } from 'path';

type KurdiezInvestingStyleOptions = {
  years?: number;
  monthlyIncome?: number;
  annualIncomeInflation?: number;
  monthlyExpenses?: number;
  annualExpenseInflation?: number;
  freeSpendingPercent?: number;
  startingAge?: number;
};

type MonthlyReport = {
  age: number;
  month: number;
  salaryIncome: string;
  expenses: string;
  dividends: string;
  freeSpending: string;
  investment: string;
  incomeFundsBalance: string;
};

const bigNumberFormat = {
  prefix: '',
  decimalSeparator: '.',
  groupSize: 0,
};

const DEFAULT_YEARS = 40;
const DEFAULT_MOS_INCOME = 3000;
const DEFAULT_ANNUAL_INCOME_INFLATION = 20; // percentage, ex. 20%
const DEFAULT_MOS_EXPENSES = 2500;
const DEFAULT_ANNUAL_EXPENSE_INFLATION = 15; // percentage, ex. 15%
const DEFAULT_FREE_SPENDING = 30; // percentage, ex. 30%
const DEFAULT_STARTING_AGE = 25;

@Command({
  name: 'monthlyIncomeFunds',
  description:
    'A simulation of investing into monthly income funds over the years',
})
export class MonthlyIncomeFunds extends CommandRunner {
  private incomeFundsBalance = new BigNumber(0);
  private monthlyReports: MonthlyReport[] = [];

  async run(
    _params: string[],
    {
      years = DEFAULT_YEARS,
      monthlyIncome = DEFAULT_MOS_INCOME,
      annualIncomeInflation = DEFAULT_ANNUAL_INCOME_INFLATION,
      monthlyExpenses = DEFAULT_MOS_EXPENSES,
      annualExpenseInflation = DEFAULT_ANNUAL_EXPENSE_INFLATION,
      freeSpendingPercent = DEFAULT_FREE_SPENDING,
      startingAge = DEFAULT_STARTING_AGE,
    }: KurdiezInvestingStyleOptions,
  ): Promise<void> {
    const annualIncomeInflationBN = new BigNumber(annualIncomeInflation);
    const annualExpenseInflationBN = new BigNumber(annualExpenseInflation);
    const freeSpendingSplit = new BigNumber(freeSpendingPercent).dividedBy(100);
    let currentYearMosIncome = new BigNumber(monthlyIncome);
    let currentYearMosExpenses = new BigNumber(monthlyExpenses);

    for (let year = 1; year <= years; year++) {
      // monthly income funds annual return is between 7-9%
      const incomeFundsAnnualReturn = new BigNumber(
        Math.random() * 3 + 7,
      ).dividedBy(100);
      const incomeFundsMonthlyReturn = incomeFundsAnnualReturn.dividedBy(12);

      const isFirstYear = year === 1;
      if (!isFirstYear) {
        const mosIncomeInflationRate = annualIncomeInflationBN
          .dividedBy(12)
          .dividedBy(100);
        const mosIncomeInflation = currentYearMosIncome.times(
          mosIncomeInflationRate,
        );
        currentYearMosIncome = currentYearMosIncome.plus(mosIncomeInflation);

        const mosExpensesInflationRate = annualExpenseInflationBN
          .dividedBy(12)
          .dividedBy(100);
        const mosExpensesInflation = currentYearMosExpenses.times(
          mosExpensesInflationRate,
        );
        currentYearMosExpenses =
          currentYearMosExpenses.plus(mosExpensesInflation);
      }

      for (let month = 1; month <= 12; month++) {
        const { dividends, freeSpending, investment } = this.simulateMonth({
          salaryIncome: currentYearMosIncome,
          expenses: currentYearMosExpenses,
          freeSpendingSplit,
          incomeFundsMonthlyReturn,
        });

        this.monthlyReports.push({
          age: startingAge + year - 1,
          month,
          salaryIncome: currentYearMosIncome.toFormat(2, bigNumberFormat),
          expenses: currentYearMosExpenses.toFormat(2, bigNumberFormat),
          dividends: dividends.toFormat(2, bigNumberFormat),
          freeSpending: freeSpending.toFormat(2, bigNumberFormat),
          investment: investment.toFormat(2, bigNumberFormat),
          incomeFundsBalance: this.incomeFundsBalance.toFormat(
            2,
            bigNumberFormat,
          ),
        });

        this.incomeFundsBalance = this.incomeFundsBalance.plus(investment);
      }
    }

    const csv = new ObjectsToCsv(this.monthlyReports);
    await csv.toDisk(join(__dirname, 'output.csv'));
  }

  simulateMonth({
    salaryIncome,
    expenses,
    freeSpendingSplit,
    incomeFundsMonthlyReturn,
  }: {
    salaryIncome: BigNumber;
    expenses: BigNumber;
    freeSpendingSplit: BigNumber;
    incomeFundsMonthlyReturn: BigNumber;
  }) {
    const dividends = this.incomeFundsBalance.multipliedBy(
      incomeFundsMonthlyReturn,
    );
    const profit = salaryIncome.plus(dividends).minus(expenses);
    const freeSpending = profit.multipliedBy(freeSpendingSplit);
    const investment = profit.minus(freeSpending);
    return {
      dividends,
      freeSpending,
      investment,
    };
  }

  @Option({
    flags: '-y, --years [number]',
    description: 'Number of years to simulate per person',
  })
  parseYear(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-i, --monthlyIncome [number]',
    description: 'Monthly take home income after tax',
  })
  parseMonthlyIncome(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-e, --monthlyExpenses [number]',
    description: 'Monthly expenses',
  })
  parseMonthlyExpenses(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-f, --freeSpendingPercent [number]',
    description:
      'Percentage of the free spending from the profit (no decimals, whole number)',
  })
  parseFreeSpendingPercent(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-ii, --annualIncomeInflation [number]',
    description:
      'Percentage of annual income inflation  (no decimals, whole number)',
  })
  parseAnnualIncomeInflation(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-ii, --annualExpenseInflation [number]',
    description:
      'Percentage of annual expense inflation  (no decimals, whole number)',
  })
  parseAnnualExpenseInflation(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-sa, --startingAge [number]',
    description: 'Age you start investing from',
  })
  parseAge(val: string): number {
    return Number(val);
  }
}

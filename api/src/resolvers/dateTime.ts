import { GraphQLScalarType } from 'graphql';

const isInvalidDate = (date: Date) => Number.isNaN(date.getTime());

const unknownToDate = (value: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const date = new Date(value as any);
  if (isInvalidDate(date)) {
    throw 'Invalid Date format';
  }
  return date;
};

const unknownToDateISOString = (value: unknown) =>
  unknownToDate(value).toISOString();

export const dateTimeResolver = new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  description: 'A valid date time value',
  serialize: unknownToDateISOString,
  parseValue: unknownToDate,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseLiteral: (ast) => unknownToDate((ast as any).value)
});

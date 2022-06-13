import { GraphQLScalarType, Kind } from 'graphql';

const throwError = (errorMessage?: string): any => {
  throw errorMessage;
};

const unknownToDate = (value: unknown) =>
  typeof value === 'string'
    ? new Date(value)
    : throwError('value is not string error');

const unknownToDateISOString = (value: unknown) =>
  unknownToDate(value).toISOString();

export const dateTimeResolver = new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  description: 'A valid date time value',
  serialize: unknownToDateISOString,
  parseValue: unknownToDate,
  parseLiteral: (ast) =>
    ast.kind === Kind.STRING
      ? new Date(ast.value)
      : throwError('value is not string error')
});

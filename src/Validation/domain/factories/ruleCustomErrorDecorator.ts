import { IError } from 'src/_Root/domain/types/Result/IError';
import { ISuccess } from 'src/_Root/domain/types/Result/ISuccess';
import { ErrorResult } from '@validation/utils';
import { TValidationRule } from '../types/TValidator';
import composeValidator from './composeValidator';
import isString from '../rules/isString';
import isOnlyEnglishLettersString from '../rules/isOnlyEnglishLettersString';
import createTupleValidationRule from './createTupleValidationRule';
import createArrayValidationRule from './createArrayValidationRule';


type TValidationRuleError = IError<string, undefined | IError<string, Array<IError<string, any> | undefined>> | Record<string, IError<string, any> | undefined>>;

type TExtractValidationRuleData<T> =
T extends {
  (value: any, errorFactory: (data: infer Data) => TValidationRuleError): TValidationRuleError
  (value: any, error: TValidationRuleError): TValidationRuleError
}
  ? Data
  : T extends (value: any, errorFactory: (data: infer Data) => TValidationRuleError) => TValidationRuleError
    ? Data
    : never;

export default function ruleCustomErrorDecorator<
    const ValidationRule extends { (value: any, error: TValidationRuleError): ISuccess | TValidationRuleError }
    | ((value: any, error: TValidationRuleError) => ISuccess | TValidationRuleError),
    const Error extends TValidationRuleError,
  >(
  validationRule: ValidationRule,
  error: Error,
): TValidationRule<Parameters<ValidationRule>[0], Extract<ReturnType<ValidationRule>, ISuccess>, Error>;

export default function ruleCustomErrorDecorator<
  const ValidationRule extends {
    (
      value: any,
      errorFactory: ((data: any) => TValidationRuleError) | { (data: any): TValidationRuleError }
    ): ISuccess | TValidationRuleError
  }
  | ((value: any, errorFactory: (data: any) => TValidationRuleError) => ISuccess | TValidationRuleError),
  const CustomErrorFactory extends (data: TExtractValidationRuleData<ValidationRule>) => TValidationRuleError,
>(
  validationRule: ValidationRule,
  errorFactory: CustomErrorFactory
): TValidationRule<Parameters<ValidationRule>[0], Extract<ReturnType<ValidationRule>, ISuccess>, ReturnType<typeof errorFactory>>;

export default function ruleCustomErrorDecorator<
  const ValidationRule extends (value: any, errorOrFactory: ErrorOrFactory) => ISuccess | TValidationRuleError,
  const ErrorOrFactory extends TValidationRuleError
  | ((data: any) => TValidationRuleError),
>(rule: ValidationRule, errorOrFactory: Parameters<ValidationRule>[1]) {
  return (value: Parameters<ValidationRule>[0]) => rule(value, errorOrFactory);
}

// type TValidatorError = IError<string, Array<Array<IError<string, any>>>>;

// type TExtractValidatorData<T> =
// T extends {
//   (value: any, errorFactory: (data: infer Data) => TValidatorError): TValidatorError
//   (value: any, error: TValidatorError): TValidatorError
// }
//   ? Data
//   : T extends (value: any, errorFactory: (data: infer Data) => TValidatorError) => TValidatorError
//     ? Data
//     : never;

// export function validatorCustomErrorDecorator<
//     const Validator extends (value: any, error: Error) => ISuccess | TValidatorError,
//     const Error extends TExtractValidatorData<Validator> extends never ? never : TValidatorError,
//   >(
//   validator: Validator,
//   error: Error
// ): TValidator<Parameters<Validator>[0], Extract<ReturnType<Validator>, ISuccess>, Error>;

// export function validatorCustomErrorDecorator<
//   const Validator extends { (value: any, errorFactory: (data: any) => TValidatorError): ISuccess | TValidatorError }
//   | ((value: any, errorFactory: (data: any) => TValidatorError) => ISuccess | TValidatorError),
//   const CustomErrorFactory extends TExtractValidatorData<Validator> extends never ? never : (data: TExtractValidatorData<Validator>) => TValidatorError,
// >(
//   validationRule: Validator,
//   errorFactory: CustomErrorFactory
// ): TValidationRule<Parameters<Validator>[0], Extract<ReturnType<Validator>, ISuccess>, ReturnType<typeof errorFactory>>;

// export function validatorCustomErrorDecorator<
//   const Validator extends (value: any, errorOrFactory: ErrorOrFactory) => ISuccess | TValidatorError,
//   const ErrorOrFactory extends TExtractValidatorData<Validator> extends never ? never : TValidatorError
//   | ((data: any) => TValidatorError),
// >(validator: Validator, errorOrFactory: Parameters<Validator>[1]) {
//   return (value: Parameters<Validator>[0]) => validator(value, errorOrFactory);
// }

type blaaa<T> =
T extends {
  (...args: infer Args): TValidationRuleError
}
  ? Args
  : never

type aaa = Parameters<<Error extends IError<string, undefined>>(value: any, error: Error) => ISuccess | TValidationRuleError>
type bbb = Parameters<typeof isString>[1]
type ccc = Parameters<typeof tupleRule>
type ddd = Parameters<typeof arrayRule>[1]


const validator = composeValidator([[isString, isOnlyEnglishLettersString]]);
const tupleRule = createTupleValidationRule([validator]);
const arrayRule = createArrayValidationRule(validator);
type bb = Parameters<typeof arrayRule>[1];


const rule1 = ruleCustomErrorDecorator(isString, new ErrorResult('Custom error', undefined));
const rule2 = ruleCustomErrorDecorator(tupleRule, new ErrorResult('Custom error', undefined));
const rule3 = ruleCustomErrorDecorator(() => new ErrorResult('Custom error', undefined), new ErrorResult('Custom error', undefined));
const rule4 = ruleCustomErrorDecorator(tupleRule, (data) => new ErrorResult('Custom error', data));
const rule5 = ruleCustomErrorDecorator(tupleRule, new ErrorResult('Custom error', undefined));
const rule6 = ruleCustomErrorDecorator(arrayRule, (data) => new ErrorResult('Custom error', data));
const rule7 = ruleCustomErrorDecorator(arrayRule, new ErrorResult('Custom error', undefined));
const rule8 = ruleCustomErrorDecorator(isString, (data) => new ErrorResult('Custom error', data));
// const validatorr = validatorCustomErrorDecorator(validator, (data) => new ErrorResult('Custom error', data));
// const validatorr2 = validatorCustomErrorDecorator(validator, new ErrorResult('Custom error', undefined));
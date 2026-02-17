/* eslint-disable max-len */
import {
  TRetrieveErrorData,
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidator,
  TValidators,
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import isArray, { TIsArrayValidationError } from '../rules/isArray';

export type TInputValue<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationInputData<First>]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationInputData<First>, ...TInputValue<Rest>]
    : [];

export type TSuccessTupleValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationSuccessData<First>['data']]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationSuccessData<First>['data'], ...TSuccessTupleValidationData<Rest>]
    : [];

export type TErrorTupleValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveErrorData<First> | undefined]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveErrorData<First> | undefined, ...TErrorTupleValidationData<Rest>]
    : [];

export type TTupleValidatorErrorFactory<Validators extends Partial<TValidators>> = {
  (data: TErrorTupleValidationData<Validators>): IError<string, typeof data>
} | ((data: TErrorTupleValidationData<Validators>) => IError<string, typeof data>);

// Результат валидации кортежа с учётом переданного/дефолтного ErrorFactory
type TTupleValidationRuleResult<
  Validators extends TValidators,
  ErrorFactory extends TTupleValidatorErrorFactory<Validators> | undefined,
  DefaultErrorFactory extends TTupleValidatorErrorFactory<Validators> | undefined,
> =
  ISuccess<TSuccessTupleValidationData<Validators>>
  | (
    // Если все валидаторы в кортеже безошибочны, error-branch схлопывается в never
    [Exclude<TErrorTupleValidationData<Validators>[number], undefined>] extends [never]
      ? never
      : (
        undefined extends ErrorFactory
          ? (
            undefined extends DefaultErrorFactory
              ? IError<string, TErrorTupleValidationData<Validators>>
              : ReturnType<Extract<DefaultErrorFactory, (...args: any[]) => any>>
          )
          : ReturnType<Extract<ErrorFactory, (...args: any[]) => any>>
      )
  )
  | TIsArrayValidationError;

// Validation rule type with overloads
export type TTupleValidationRule<
  Validators extends TValidators,
  DefaultErrorFactory extends TTupleValidatorErrorFactory<Validators> | undefined = undefined,
> = {
  // Вызов без errorFactory
  (value: TInputValue<Validators> | Readonly<TInputValue<Validators>>):
  TTupleValidationRuleResult<Validators, undefined, DefaultErrorFactory>;

  // Вызов с errorFactory
  <const ErrorFactory extends TTupleValidatorErrorFactory<Validators>>(
    value: TInputValue<Validators> | Readonly<TInputValue<Validators>>,
    errorFactory: ErrorFactory,
  ): TTupleValidationRuleResult<Validators, ErrorFactory, DefaultErrorFactory>;

  // Catch-all
  <
    const ErrorFactory extends TTupleValidatorErrorFactory<Validators> | undefined = undefined,
    const Result extends TTupleValidationRuleResult<Validators, ErrorFactory, DefaultErrorFactory>
    = TTupleValidationRuleResult<Validators, ErrorFactory, DefaultErrorFactory>,
  >(
    value: TInputValue<Validators> | Readonly<TInputValue<Validators>>,
    errorFactory?: ErrorFactory,
  ): Result;
};

type TValidationAccumulator<Validators extends TValidators> = {
  validResults: TSuccessTupleValidationData<Validators>;
  errors: TErrorTupleValidationData<Validators>;
  errorMessages: string[];
  isError: boolean;
};

// Без defaultErrorFactory
export default function createTupleValidationRule<const Validators extends TValidators>(
  validators: Validators,
): TTupleValidationRule<Validators>;

// С defaultErrorFactory
export default function createTupleValidationRule<
  const Validators extends TValidators,
  const ErrorFactory extends TTupleValidatorErrorFactory<Validators>,
>(
  validators: Validators,
  defaultErrorFactory: ErrorFactory,
): TTupleValidationRule<Validators, ErrorFactory>;

// С или без defaultErrorFactory
export default function createTupleValidationRule<
  const Validators extends TValidators,
  const ErrorFactory extends TTupleValidatorErrorFactory<Validators> | undefined = undefined,
>(
  validators: Validators,
  defaultErrorFactory?: ErrorFactory,
): ErrorFactory extends TTupleValidatorErrorFactory<Validators>
  ? TTupleValidationRule<Validators, ErrorFactory>
  : TTupleValidationRule<Validators>;

export default function createTupleValidationRule<const Validators extends TValidators>(
  validators: Validators,
  defaultErrorFactory?: (data: TErrorTupleValidationData<Validators>) => IError<string, TErrorTupleValidationData<Validators>>,
) {
  return <const Values extends TInputValue<Validators> | Readonly<TInputValue<Validators>>>(
    value: Values,
    errorFactory?: (data: TErrorTupleValidationData<Validators>) => IError<string, TErrorTupleValidationData<Validators>>,
  ): ISuccess<TSuccessTupleValidationData<Validators>>
  | (
    IError<string, TErrorTupleValidationData<Validators>>
    | TIsArrayValidationError
  ) => {
    const arrayValidation = isArray(value);
    if (arrayValidation.status === 'error') {
      return arrayValidation;
    }

    const initialAcc: TValidationAccumulator<Validators> = {
      validResults: [] as unknown as TSuccessTupleValidationData<Validators>,
      errors: [] as unknown as TErrorTupleValidationData<Validators>,
      errorMessages: [],
      isError: false,
    };

    const result = initialAcc;

    // eslint-disable-next-line no-restricted-syntax
    for (const [index, validator] of validators.entries()) {
      // eslint-disable-next-line no-continue
      if (!validator) continue;

      const validationResult = validator(value[index]);

      if (validationResult.status === 'success') {
        result.validResults[index] = validationResult.data;
        result.errors[index] = undefined;
      } else {
        result.isError = true;
        result.errors[index] = validationResult;
        result.errorMessages.push(`${index}: ${validationResult.message}`);
      }
    }

    if (result.isError) {
      if (errorFactory) {
        return errorFactory(result.errors);
      }
      if (defaultErrorFactory) {
        return defaultErrorFactory(result.errors);
      }
      return new ErrorResult(
        `Tuple validation failed for the following elements:${result.errorMessages.join(' ')}`,
        result.errors,
      );
    }

    return new SuccessResult(result.validResults);
  };
}

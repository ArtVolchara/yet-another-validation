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

export type TSuccessValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationSuccessData<First>['data']]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationSuccessData<First>['data'], ...TSuccessValidationData<Rest>]
    : [];

export type TErrorValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveErrorData<First> | undefined]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveErrorData<First> | undefined, ...TErrorValidationData<Rest>]
    : [];

// Validation rule type with overloads
type TTupleValidationRule<
  Validators extends TValidators,
  DefaultErrorFactoryOrError extends IError<string, TErrorValidationData<Validators>> |
  { (data: TErrorValidationData<Validators>): IError<string, TErrorValidationData<Validators>> }
  = IError<string, TErrorValidationData<Validators>>,
> = {
  <const ErrorFactory extends (data: TErrorValidationData<Validators>) => IError<string, any>>(
    value: TInputValue<Validators> | Readonly<TInputValue<Validators>>,
    errorFactory: ErrorFactory,
  ): ISuccess<TSuccessValidationData<Validators>> | ReturnType<ErrorFactory> | TIsArrayValidationError;

  (value: TInputValue<Validators> | Readonly<TInputValue<Validators>>): ISuccess<TSuccessValidationData<Validators>>
  | TIsArrayValidationError
  | (DefaultErrorFactoryOrError extends IError<string, TErrorValidationData<Validators>>
    ? DefaultErrorFactoryOrError
    : ReturnType<Extract<DefaultErrorFactoryOrError, (data: any) => any>>)
};

type TValidationAccumulator<Validators extends TValidators> = {
  validResults: TSuccessValidationData<Validators>;
  errors: TErrorValidationData<Validators>;
  errorMessages: string[];
  isError: boolean;
};

// Rule factory type with overloads
export default function createTupleValidationRule<
  const Validators extends TValidators,
  const ErrorFactory extends (data: TErrorValidationData<Validators>) => IError<string, TErrorValidationData<Validators>>,
>(
  validators: Validators,
  errorFactory: ErrorFactory,
): TTupleValidationRule<Validators, ErrorFactory>;

export default function createTupleValidationRule<const Validators extends TValidators>(
  validators: Validators,
): TTupleValidationRule<Validators>;

export default function createTupleValidationRule<const Validators extends TValidators>(
  validators: Validators,
  defaultErrorFactory?: (data: TErrorValidationData<Validators>) => IError<string, TErrorValidationData<Validators>>,
) {
  return <const Values extends TInputValue<Validators> | Readonly<TInputValue<Validators>>>(
    value: Values,
    errorFactory?: (data: TErrorValidationData<Validators>) => IError<string, TErrorValidationData<Validators>>,
  ): ISuccess<TSuccessValidationData<Validators>>
  | (
    IError<string, TErrorValidationData<Validators>>
    | TIsArrayValidationError
  ) => {
    const arrayValidation = isArray(value);
    if (arrayValidation.status === 'error') {
      return arrayValidation;
    }

    const initialAcc: TValidationAccumulator<Validators> = {
      validResults: [] as unknown as TSuccessValidationData<Validators>,
      errors: [] as unknown as TErrorValidationData<Validators>,
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

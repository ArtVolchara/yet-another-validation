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

// Validation rule type with overloads
export type TTupleValidationRule<
  Validators extends TValidators,
  DefaultErrorFactoryOrError extends IError<string, any> | TTupleValidatorErrorFactory<Validators> | undefined = undefined,
> = {
  // overload for usage without any custom Error or custom ErrorFactory
  (value: TInputValue<Validators> | Readonly<TInputValue<Validators>>): ISuccess<TSuccessTupleValidationData<Validators>>
  | (
    undefined extends DefaultErrorFactoryOrError
      ? IError<string, TErrorTupleValidationData<Validators>>
      : (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      )
  )
  | TIsArrayValidationError

  // overload for usage with custom Error
  <const Error extends TTupleValidatorErrorFactory<Validators>>(
    value: TInputValue<Validators> | Readonly<TInputValue<Validators>>,
    error: Error,
  ): ISuccess<TSuccessTupleValidationData<Validators>> | Error | TIsArrayValidationError;

  // overload for usage with custom ErrorFactory
  <const ErrorFactory extends TTupleValidatorErrorFactory<Validators>>(
    value: TInputValue<Validators> | Readonly<TInputValue<Validators>>,
    errorFactory: ErrorFactory,
  ): ISuccess<TSuccessTupleValidationData<Validators>> | ReturnType<ErrorFactory> | TIsArrayValidationError;

  // overload for usage with or without custom Error or custom ErrorFactory
  <
    const ErrorFactoryOrError extends TTupleValidatorErrorFactory<Validators> | IError<string, any> | undefined = undefined,
    const Result extends undefined extends ErrorFactoryOrError
      ? ISuccess<TSuccessTupleValidationData<Validators>>
      | (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      )
      | TIsArrayValidationError
      : ISuccess<TSuccessTupleValidationData<Validators>>
      | (
        ErrorFactoryOrError extends IError<string, any>
          ? ErrorFactoryOrError
          : ReturnType<Extract<ErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsArrayValidationError = undefined extends ErrorFactoryOrError
      ? ISuccess<TSuccessTupleValidationData<Validators>>
      | (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsArrayValidationError
      : ISuccess<TSuccessTupleValidationData<Validators>>
      | (
        ErrorFactoryOrError extends IError<string, any>
          ? ErrorFactoryOrError
          : ReturnType<Extract<ErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsArrayValidationError,
  >(
    value: TInputValue<Validators> | Readonly<TInputValue<Validators>>,
    errorFactoryOrError?: ErrorFactoryOrError,
  ): Result
};

type TValidationAccumulator<Validators extends TValidators> = {
  validResults: TSuccessTupleValidationData<Validators>;
  errors: TErrorTupleValidationData<Validators>;
  errorMessages: string[];
  isError: boolean;
};

// Rule factory type with overloads
export default function createTupleValidationRule<
  const Validators extends TValidators,
  const ErrorFactory extends (data: TErrorTupleValidationData<Validators>) => IError<string, TErrorTupleValidationData<Validators>>,
>(
  validators: Validators,
  errorFactory: ErrorFactory,
): TTupleValidationRule<Validators, ErrorFactory>;

// overload for usage without any custom Error or custom ErrorFactory
export default function createTupleValidationRule<const Validators extends TValidators>(
  validators: Validators,
): TTupleValidationRule<Validators>;


// overload for usage with custom ErrorFactory
export default function createTupleValidationRule<
  const Validators extends TValidators,

  const ErrorFactory extends TTupleValidatorErrorFactory<Validators>,
>(
  validators: Validators,
  defaultErrorFactory: ErrorFactory,
): TTupleValidationRule<Validators, ErrorFactory>;

// overload for usage with custom Error
export default function createTupleValidationRule<
  const Validators extends TValidators,
  const Error extends IError<string, any>,
>(
  validator: Validators,
  defaultError: Error,
): TTupleValidationRule<Validators, Error>;

// overload for usage with or without custom Error or custom ErrorFactory
export default function createTupleValidationRule<
  const Validators extends TValidators,
  const ErrorOrFactory extends IError<string, any> | TTupleValidatorErrorFactory<Validators> | undefined = undefined,
>(
  Validators: Validators,
  defaultErrorOrFactory?: ErrorOrFactory,
): ErrorOrFactory extends TTupleValidatorErrorFactory<Validators> | IError<string, any>
  ? TTupleValidationRule<Validators, ErrorOrFactory>
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

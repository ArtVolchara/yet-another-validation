import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidator,
} from '../types/TValidator';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import isArray, { TIsArrayValidationError } from '../rules/isArray';

export type TArrayValidatorErrorFactory<Validator extends TValidator> = {
  (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>): IError<string, typeof data>
} | ((data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, typeof data>);

export type TValidationAccumulator<Validator extends TValidator> = {
  validResults: Array<TRetrieveValidationSuccessData<Validator>>;
  errors: Array<TRetrieveError<ReturnType<Validator>> | undefined>;
  errorMessages: string[];
  isError: boolean;
};

export type TArrayValidationRule<
  Validator extends TValidator,
  DefaultErrorFactoryOrError extends IError<string, any> | TArrayValidatorErrorFactory<Validator> | undefined = undefined,
> = {
  // overload for usage without any custom Error or custom ErrorFactory
  (value: Array<TRetrieveValidationInputData<Validator>>): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
  | (
    undefined extends DefaultErrorFactoryOrError
      ? IError<string, Array<TRetrieveError<ReturnType<Validator>>>>
      : (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      )
  )
  | TIsArrayValidationError

  // overload for usage with custom Error
  <const Error extends TArrayValidatorErrorFactory<Validator>>(
    value: Array<TRetrieveValidationInputData<Validator>>,
    error: Error,
  ): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>> | Error | TIsArrayValidationError;

  // overload for usage with custom ErrorFactory
  <const ErrorFactory extends TArrayValidatorErrorFactory<Validator>>(
    value: Array<TRetrieveValidationInputData<Validator>>,
    errorFactory: ErrorFactory,
  ): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>> | ReturnType<ErrorFactory> | TIsArrayValidationError;

  // overload for usage with or without custom Error or custom ErrorFactory
  <
    const ErrorFactoryOrError extends TArrayValidatorErrorFactory<Validator> | IError<string, any> | undefined = undefined,
    const Result extends undefined extends ErrorFactoryOrError
      ? ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
      | (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      )
      | TIsArrayValidationError
      : ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
      | (
        ErrorFactoryOrError extends IError<string, any>
          ? ErrorFactoryOrError
          : ReturnType<Extract<ErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsArrayValidationError = undefined extends ErrorFactoryOrError
      ? ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
      | (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsArrayValidationError
      : ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
      | (
        ErrorFactoryOrError extends IError<string, any>
          ? ErrorFactoryOrError
          : ReturnType<Extract<ErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsArrayValidationError,
  >(
    value: Array<TRetrieveValidationInputData<Validator>>,
    errorFactoryOrError?: ErrorFactoryOrError,
  ): Result
};

// overload for usage without any custom Error or custom ErrorFactory
export default function createArrayValidationRule<const Validator extends TValidator>(
  validator: Validator,
): TArrayValidationRule<Validator>;

// overload for usage with custom ErrorFactory
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorFactory extends TArrayValidatorErrorFactory<Validator>,
>(
  validator: Validator,
  defaultErrorFactory: ErrorFactory,
): TArrayValidationRule<Validator, ErrorFactory>;

// overload for usage with custom Error
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const Error extends IError<string, any>,
>(
  validator: Validator,
  defaultError: Error,
): TArrayValidationRule<Validator, Error>;

// overload for usage with or without custom Error or custom ErrorFactory
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorOrFactory extends IError<string, any> | TArrayValidatorErrorFactory<Validator> | undefined = undefined,
>(
  validator: Validator,
  defaultErrorOrFactory?: ErrorOrFactory,
): ErrorOrFactory extends TArrayValidatorErrorFactory<Validator> | IError<string, any>
  ? TArrayValidationRule<Validator, ErrorOrFactory>
  : TArrayValidationRule<Validator>;

export default function createArrayValidationRule<
const Validator extends TValidator,
const ErrorOrFactory extends IError<string, any> | TArrayValidatorErrorFactory<Validator> | undefined = undefined,
>(
  validator: Validator,
  defaultErrorOrFactory?: ErrorOrFactory,
) {
  return (
    value: Array<TRetrieveValidationInputData<Validator>>,
    errorFactory?: (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, any>,
  ): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
    | (
    IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>
    | TIsArrayValidationError
    ) => {
    try {
      // Проверка на массив в рантайме
      const arrayValidation = isArray(value);
      if (arrayValidation.status === 'error') {
        return arrayValidation;
      }

      const initialAcc: TValidationAccumulator<Validator> = {
        validResults: [],
        errors: [],
        errorMessages: [],
        isError: false,
      };

      const result = value.reduce((acc, item, index) => {
        const validationResult = validator(item);
        if (validationResult.status === 'success') {
          acc.validResults.push(validationResult.data);
          acc.errors.push(undefined);
        } else {
          acc.isError = true;
          acc.errors.push(validationResult as TRetrieveError<ReturnType<Validator>>);
          acc.errorMessages.push(`${index}: ${validationResult.message}`);
        }
        return acc;
      }, initialAcc);

      if (result.isError) {
        if (errorFactory) {
          return errorFactory(result.errors);
        }
        if (defaultErrorOrFactory) {
          if (typeof defaultErrorOrFactory === 'function') {
            return defaultErrorOrFactory(result.errors);
          }
          return defaultErrorOrFactory;
        }
        return new ErrorResult(
          `Array validation failed for the following elements:\n${result.errorMessages.join('\n')}`,
          result.errors,
        );
      }

      return new SuccessResult(result.validResults);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

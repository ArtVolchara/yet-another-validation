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

export type TErrorFactory<Validator extends TValidator> = { (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>): IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>> }
| ((data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>);

export type TValidationAccumulator<Validator extends TValidator> = {
  validResults: Array<TRetrieveValidationSuccessData<Validator>>;
  errors: Array<TRetrieveError<ReturnType<Validator>> | undefined>;
  errorMessages: string[];
  isError: boolean;
};

export type TArrayValidationRule<
  Validator extends TValidator,
  DefaultErrorFactoryOrError extends IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>> | TErrorFactory<Validator>
  = IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>> | TErrorFactory<Validator>,
> = {
  <const ErrorFactory extends (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>>(
    value: Array<TRetrieveValidationInputData<Validator>>,
    errorFactory: ErrorFactory,
  ): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>> | ReturnType<ErrorFactory> | TIsArrayValidationError;
  (value: Array<TRetrieveValidationInputData<Validator>>, errorOrFactory: DefaultErrorFactoryOrError): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>> |
  TIsArrayValidationError |
  (
    DefaultErrorFactoryOrError extends IError<string, any>
      ? DefaultErrorFactoryOrError
      : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
  );
};

// Rule factory type with overloads
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorFactory extends TErrorFactory<Validator>,
>(
  validator: Validator,
  defaultErrorFactory: ErrorFactory,
): TArrayValidationRule<Validator, ErrorFactory>;

export default function createArrayValidationRule<const Validator extends TValidator>(
  validator: Validator,
): TArrayValidationRule<Validator>;

export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorFactory extends TErrorFactory<Validator> | undefined,
>(
  validator: Validator,
  defaultErrorFactory?: ErrorFactory,
): ErrorFactory extends TErrorFactory<Validator> ? TArrayValidationRule<Validator, ErrorFactory> : TArrayValidationRule<Validator>;

export default function createArrayValidationRule<const Validator extends TValidator>(
  validator: Validator,
  defaultErrorFactory?: (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>,
) {
  return <const Values extends Array<TRetrieveValidationInputData<Validator>>>(
    value: Values,
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
        if (defaultErrorFactory) {
          return defaultErrorFactory(result.errors);
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

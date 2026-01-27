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

type TInputValue<Validator extends TValidator> = Array<TRetrieveValidationInputData<Validator>>;

type TArrayValidationRule<
  Validator extends TValidator,
  DefaultErrorFactoryOrError extends IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>> |
  { (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>): IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>}
  = IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>,
> = {
  <const ErrorFactory extends (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>>(
    value: TInputValue<Validator>,
    errorFactory: ErrorFactory,
  ): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>> | ReturnType<ErrorFactory> | TIsArrayValidationError;
  (
    value: TInputValue<Validator>,
  ): ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
  | TIsArrayValidationError
  | (DefaultErrorFactoryOrError extends IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>
    ? DefaultErrorFactoryOrError
    : ReturnType<Extract<DefaultErrorFactoryOrError, (data: any) => any>>);
};

type TValidationAccumulator<Validator extends TValidator> = {
  validResults: Array<TRetrieveValidationSuccessData<Validator>>;
  errors: Array<TRetrieveError<ReturnType<Validator>> | undefined>;
  errorMessages: string[];
  isError: boolean;
};

// Rule factory type with overloads
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorFactory extends { (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>): IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>},
>(
  validator: Validator,
  errorFactory: ErrorFactory,
): TArrayValidationRule<Validator, ErrorFactory>;

export default function createArrayValidationRule<const Validator extends TValidator>(
  validator: Validator,
): TArrayValidationRule<Validator>;


export default function createArrayValidationRule<const Validator extends TValidator>(
  validator: Validator,
  defaultErrorFactory?: (data: Array<TRetrieveError<ReturnType<Validator>> | undefined>) => IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>,
) {
  return <const Values extends TInputValue<Validator>>(
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
          result.errors
        );
      }

      return new SuccessResult(result.validResults);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
};

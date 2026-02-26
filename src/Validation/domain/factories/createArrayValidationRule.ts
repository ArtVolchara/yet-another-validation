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

// Результат валидации массива с учётом переданного дефолтного error factory
type TArrayValidationRuleResult<
  Validator extends TValidator,
  ErrorFactory extends TArrayValidatorErrorFactory<Validator> | undefined,
  DefaultErrorFactory extends TArrayValidatorErrorFactory<Validator> | undefined,
> =
  ISuccess<Array<TRetrieveValidationSuccessData<Validator>['data']>>
  | (
    // Если валидатор элементов безошибочен (возвращает только ISuccess), error-branch схлопывается в never
    [TRetrieveError<ReturnType<Validator>>] extends [never]
      ? never
      : (
        undefined extends ErrorFactory
          ? (
            undefined extends DefaultErrorFactory
              ? IError<string, Array<TRetrieveError<ReturnType<Validator>>>>
              : ReturnType<Extract<DefaultErrorFactory, (...args: any[]) => any>>
          )
          : ReturnType<Extract<ErrorFactory, (...args: any[]) => any>>
      )
  )
  | TIsArrayValidationError;

export type TArrayValidationRule<
  Validator extends TValidator,
  DefaultErrorFactory extends TArrayValidatorErrorFactory<Validator> | undefined = undefined,
> = {
  // Вызов без errorFactory
  (value: Array<TRetrieveValidationInputData<Validator>>):
  TArrayValidationRuleResult<Validator, undefined, DefaultErrorFactory>;

  // Вызов с errorFactory
  <const ErrorFactory extends TArrayValidatorErrorFactory<Validator>>(
    value: Array<TRetrieveValidationInputData<Validator>>,
    errorFactory: ErrorFactory,
  ): TArrayValidationRuleResult<Validator, ErrorFactory, DefaultErrorFactory>;

  // Catch-all
  <
    const ErrorFactory extends TArrayValidatorErrorFactory<Validator> | undefined = undefined,
  >(
    value: Array<TRetrieveValidationInputData<Validator>>,
    errorFactory?: ErrorFactory,
  ): TArrayValidationRuleResult<Validator, ErrorFactory, DefaultErrorFactory>;
};

// Без default error factory
export default function createArrayValidationRule<const Validator extends TValidator>(
  validator: Validator,
): TArrayValidationRule<Validator>;

// С default error factory
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorFactory extends TArrayValidatorErrorFactory<Validator>,
>(
  validator: Validator,
  defaultErrorFactory: ErrorFactory,
): TArrayValidationRule<Validator, ErrorFactory>;

// С или без defaultErrorFactory
export default function createArrayValidationRule<
  const Validator extends TValidator,
  const ErrorFactory extends TArrayValidatorErrorFactory<Validator> | undefined = undefined,
>(
  validator: Validator,
  defaultErrorFactory?: ErrorFactory,
): ErrorFactory extends TArrayValidatorErrorFactory<Validator>
  ? TArrayValidationRule<Validator, ErrorFactory>
  : TArrayValidationRule<Validator>;

export default function createArrayValidationRule<
  const Validator extends TValidator,
  const DefaultErrorFactory extends TArrayValidatorErrorFactory<Validator>,
>(
  validator: Validator,
  defaultErrorFactory?: DefaultErrorFactory,
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

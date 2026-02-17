import { TObjectEntries } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TValidator } from '../types/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import isObject, { TIsObjectValidationError } from '../rules/isObject';

export type TObjectValidatorsSchema = Record<string, TValidator>;

export type TObjectValidatorErrorFactory<ValidatorsSchema extends TObjectValidatorsSchema> = {
  (data: { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }): IError<string, typeof data>
} | ((data: { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }) => IError<string, typeof data>);

// Результат валидации объекта с учётом переданного дефолтного ErrorFactory
type TObjectValidationRuleResult<
  ValidatorsSchema extends TObjectValidatorsSchema,
  ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema> | undefined,
  DefaultErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema> | undefined,
> =
  ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  | (
    // Если все валидаторы полей безошибочны (возвращают только ISuccess), error-branch схлопывается в never
    [{ [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }[keyof ValidatorsSchema]] extends [never]
      ? never
      : (
        undefined extends ErrorFactory
          ? (
            undefined extends DefaultErrorFactory
              ? IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
              : ReturnType<Extract<DefaultErrorFactory, (...args: any[]) => any>>
          )
          : ReturnType<Extract<ErrorFactory, (...args: any[]) => any>>
      )
  )
  | TIsObjectValidationError;

// Validation rule type with overloads
export type TObjectValidationRule<
  ValidatorsSchema extends TObjectValidatorsSchema,
  DefaultErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema> | undefined = undefined,
> = {

  // overload for usage without error factory
  (value: Record<string | symbol, any> & { length?: never }): TObjectValidationRuleResult<ValidatorsSchema, undefined, DefaultErrorFactory>;

  // overload for usage with error factory
  <const ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>>(
    value: Record<string | symbol, any> & { length?: never },
    errorFactory: ErrorFactory,
  ): TObjectValidationRuleResult<ValidatorsSchema, ErrorFactory, DefaultErrorFactory>;

  // overload for usage with or without error factory
  <
    const ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema> | undefined = undefined,
    const Result extends TObjectValidationRuleResult<ValidatorsSchema, ErrorFactory, DefaultErrorFactory>
    = TObjectValidationRuleResult<ValidatorsSchema, ErrorFactory, DefaultErrorFactory>,
  >(
    value: Record<string | symbol, any> & { length?: never },
    errorFactory?: ErrorFactory,
  ): Result;
};

// overload for usage without default error factory
export default function createObjectValidationRule<
  ValidatorsSchema extends TObjectValidatorsSchema,
>(
  validatorsSchema: ValidatorsSchema,
): TObjectValidationRule<ValidatorsSchema>;

// overload for usage with default error factory
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const DefaultErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>,
>(
  validatorsSchema: ValidatorsSchema,
  defaultErrorFactory: DefaultErrorFactory,
): TObjectValidationRule<ValidatorsSchema, DefaultErrorFactory>;

// overload for usage with or without default error factory
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema> | undefined = undefined,
>(
  validatorsSchema: ValidatorsSchema,
  defaultErrorFactory?: ErrorFactory,
): ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>
  ? TObjectValidationRule<ValidatorsSchema, ErrorFactory>
  : TObjectValidationRule<ValidatorsSchema>;

export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const DefaultErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>,
>(
  validatorsSchema: ValidatorsSchema,
  defaultErrorFactory?: DefaultErrorFactory,
) {
  const schemaEntries = Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>;

  return <const ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>>(
    value: Record<string | symbol, any> & { length?: never },
    errorFactory?: ErrorFactory,
  ): ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  | IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }> | TIsObjectValidationError => {
    try {
      const objectValidation = isObject(value);
      if (objectValidation.status === 'error') {
        return objectValidation;
      }

      const objectValue = objectValidation.data;
      const initialAcc = {
        validResults: {} as { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] },
        errors: {} as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> },
        errorMessages: [] as string[],
        isError: false,
      };

      const result = schemaEntries.reduce((acc, [field, fieldValidator]) => {
        const validationResult = fieldValidator(objectValue[String(field)]);
        if (validationResult.status === 'success') {
          acc.validResults[field] = validationResult.data;
        } else {
          acc.isError = true;
          acc.errors[field] = validationResult as TRetrieveError<ReturnType<ValidatorsSchema[typeof field]>>;
          acc.errorMessages.push(`${String(field)}: ${validationResult.message}`);
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
          `Object validation failed for the following fields:\n${result.errorMessages.join('\n')}`,
          result.errors,
        );
      }
      return new SuccessResult(result.validResults);
    } catch (e) {
      console.error(e);
      return new ErrorResult(
        'Unexpected validation error',
        {} as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> },
      );
    }
  };
}

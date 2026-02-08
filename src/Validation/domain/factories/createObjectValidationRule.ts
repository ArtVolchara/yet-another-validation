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

// Validation rule type with overloads
export type TObjectValidationRule<
  ValidatorsSchema extends TObjectValidatorsSchema,
  DefaultErrorFactoryOrError extends IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
  | TObjectValidatorErrorFactory<ValidatorsSchema> | undefined = undefined,
> = {

  // overload for usage without any custom Error or custom ErrorFactory
  (value: Record<string | symbol, any>): ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  | (
    undefined extends DefaultErrorFactoryOrError
      ? IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
      : (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      )
  )
  | TIsObjectValidationError

  // overload for usage with custom Error
  <const Error extends TObjectValidatorErrorFactory<ValidatorsSchema>>(
    value: Record<string | symbol, any>,
    error: Error,
  ): ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }> | Error | TIsObjectValidationError;

  // overload for usage with ErrorFactory
  <const ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>>(
    value: Record<string | symbol, any>,
    errorFactory: ErrorFactory,
  ): ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }> | ReturnType<ErrorFactory> | TIsObjectValidationError;

  // overload for usage without any custom Error or custom ErrorFactory
  <
    const ErrorFactoryOrError extends TObjectValidatorErrorFactory<ValidatorsSchema> | IError<string, any> | undefined = undefined,
    const Result extends undefined extends ErrorFactoryOrError
      ? ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
      | (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      )
      | TIsObjectValidationError
      : ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
      | (
        ErrorFactoryOrError extends IError<string, any>
          ? ErrorFactoryOrError
          : ReturnType<Extract<ErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsObjectValidationError = undefined extends ErrorFactoryOrError
      ? ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
      | (
        DefaultErrorFactoryOrError extends IError<string, any>
          ? DefaultErrorFactoryOrError
          : ReturnType<Extract<DefaultErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsObjectValidationError
      : ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
      | (
        ErrorFactoryOrError extends IError<string, any>
          ? ErrorFactoryOrError
          : ReturnType<Extract<ErrorFactoryOrError, (...args: any[]) => any>>
      ) | TIsObjectValidationError,
  >(
    value: Record<string | symbol, any>,
    errorFactoryOrError?: ErrorFactoryOrError,
  ): Result
};

type TValidationAccumulator<ValidatorsSchema extends TObjectValidatorsSchema> = {
  validResults: { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] };
  errors: { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> };
  errorMessages: string[];
  isError: boolean;
};

// overload for usage without any custom Error or custom ErrorFactory
export default function createObjectValidationRule<ValidatorsSchema extends TObjectValidatorsSchema>(
  validatorsSchema: ValidatorsSchema,
): TObjectValidationRule<ValidatorsSchema>;

// overload for usage with custom ErrorFactory
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const ErrorFactory extends TObjectValidatorErrorFactory<ValidatorsSchema>,
>(
  validatorsSchema: ValidatorsSchema,
  defaultErrorFactory: ErrorFactory,
): TObjectValidationRule<ValidatorsSchema, ErrorFactory>;

// overload for usage with custom Error
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const Error extends IError<string, any>,
>(
  validatorsSchema: ValidatorsSchema,
  defaultError: Error,
): TObjectValidationRule<ValidatorsSchema, Error>;

// overload for usage with or without custom Error or custom ErrorFactory
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const ErrorOrFactory extends IError<string, any> | TObjectValidatorErrorFactory<ValidatorsSchema> | undefined = undefined,
>(
  validatorsSchema: ValidatorsSchema,
  defaultErrorOrFactory?: ErrorOrFactory,
): ErrorOrFactory extends TObjectValidatorErrorFactory<ValidatorsSchema> | IError<string, any>
  ? TObjectValidationRule<ValidatorsSchema, ErrorOrFactory>
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
    value: Record<string | symbol, any>,
    errorFactory?: ErrorFactory,
  ): ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  | IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }> | TIsObjectValidationError => {
    try {
      const objectValidation = isObject(value);
      if (objectValidation.status === 'error') {
        return objectValidation;
      }

      const objectValue = objectValidation.data;
      const initialAcc: TValidationAccumulator<ValidatorsSchema> = {
        validResults: {} as { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] },
        errors: {} as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> },
        errorMessages: [],
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

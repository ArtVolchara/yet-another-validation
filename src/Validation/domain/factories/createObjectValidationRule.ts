import { TObjectEntries } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TValidator } from '../types/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import isObject, { TIsObjectValidationError } from '../rules/isObject';

export type TObjectValidatorsSchema = Record<string, TValidator>;

// Validation rule type with overloads
type TObjectValidationRule<
  ValidatorsSchema extends TObjectValidatorsSchema,
  DefaultErrorFactoryOrError extends IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>
  | { (data: { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }): IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }> }
  = IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>,
> = {
  <const ErrorFactory extends (data: {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }) => IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>>(
    value: Record<string | symbol, any>,
    errorFactory: ErrorFactory,
  ): ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  | ReturnType<ErrorFactory>
  | TIsObjectValidationError;

  (value: Record<string | symbol, any>): ISuccess<{
    [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data']
  }>
  | TIsObjectValidationError
  | (DefaultErrorFactoryOrError extends IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>
    ? DefaultErrorFactoryOrError
    : ReturnType<Exclude<DefaultErrorFactoryOrError, IError<string, any>>>)
};

type TValidationAccumulator<ValidatorsSchema extends TObjectValidatorsSchema> = {
  validResults: {
    [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data']
  };
  errors: {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  };
  errorMessages: string[];
  isError: boolean;
};

// Rule factory type with overloads
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const ErrorFactory extends (
    data: {
      [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
    }
  ) => IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>,

>(
  validatorsSchema: ValidatorsSchema,
  errorFactory: ErrorFactory,
): TObjectValidationRule<ValidatorsSchema, ErrorFactory>;

export default function createObjectValidationRule<ValidatorsSchema extends TObjectValidatorsSchema>(
  validatorsSchema: ValidatorsSchema,
): TObjectValidationRule<ValidatorsSchema>;

// Валидационные правила схемы для каждого свойства должны быть готовы вне зависимости от типа аргумента (но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается (не выбрасывается)
// ErrorResult c нужным message.
export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
  const DefaultErrorFactory extends (
    data: {
      [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
    }
  ) => IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>,
>(
  validatorsSchema: ValidatorsSchema,
  defaultErrorFactory?: DefaultErrorFactory,
) {
  const schemaEntries = Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>;

  return <const ErrorFactory extends (
    data: {
      [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
    }
  ) => IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }>>(
    value: Record<string | symbol, any>,
    errorFactory?: ErrorFactory,
  ): ISuccess<{
    [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data']
  }>
  | IError<string, {
    [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
  }> | TIsObjectValidationError => {
    try {
      const objectValidation = isObject(value);
      if (objectValidation.status === 'error') {
        return objectValidation;
      }

      const objectValue = objectValidation.data;
      const initialAcc: TValidationAccumulator<ValidatorsSchema> = {
        validResults: {} as {
          [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data']
        },
        errors: {} as {
          [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>>
        },
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

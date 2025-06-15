import { TObjectEntries } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TRetrieveValidationInputData, TValidator } from '../types/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import isObject, { TIsObjectValidationError } from '../validators/isObject';

// Объект с валидаторами для каждого ключа в объекте
export type TObjectValidatorsSchema = Record<string, TValidator>;

// При использовании IDE выводит ненужный type-alias, что нечитаемо. Ниже нарушил don't repeat yourself.
// export type TSuccessValidationData<ValidatorsSchema extends TObjectValidatorsSchema> = { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] };
// export type TErrorValidationData<ValidatorsSchema extends TObjectValidatorsSchema> = { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> };

// Валидационные правила схемы для каждого свойства должны быть готовы вне зависимости от типа аргумента (но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается (не выбрасывается)
// ErrorResult c нужным message.

type TValidationAccumulator<ValidatorsSchema extends TObjectValidatorsSchema> = {
  validResults: { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] };
  errors: { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> };
  errorMessages: string[];
  isError: boolean;
};

export default function createObjectValidationRule<const ValidatorsSchema extends TObjectValidatorsSchema>(
  validatorsSchema: ValidatorsSchema,
) {
  return (value: unknown): 
    ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
    | IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
    | TIsObjectValidationError => {
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

      const result = (Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>)
        .reduce((acc, [field, fieldValidator]) => {
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
        {} as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }
      );
    }
  };
}

import { TObjectEntries } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import {TRetrieveValidationInputData, TValidator} from '../types/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';

// Объект с валидаторами для каждого ключа в объекте
export type TObjectValidatorsSchema = Record<string, TValidator>;

// При использовании IDE выводит ненужный type-alias, что нечитаемо. Ниже нарушил don't repeat yourself.
// export type TSuccessValidationData<ValidatorsSchema extends TObjectValidatorsSchema> = { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] };
// export type TErrorValidationData<ValidatorsSchema extends TObjectValidatorsSchema> = { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> };

// Валидационные правила схемы для каждого свойства должны быть готовы вне зависимости от типа аргумента (но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается (не выбрасывается)
// ErrorResult c нужным message.
export default function createObjectValidationRule<const ValidatorsSchema extends TObjectValidatorsSchema>(
  validatorsSchema: ValidatorsSchema,
) {
  return (value: { [Key in keyof ValidatorsSchema]: TRetrieveValidationInputData<ValidatorsSchema[Key]> }) => {
    try {
      const errors = {} as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> };
      let overallErrorMessage = '';
      const result = (Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>)
        .reduce((acc, fieldValidationEntry) => {
          const [field, fieldValidator] = fieldValidationEntry;
          const validationResult = fieldValidator(value?.[field as keyof typeof value]);
          if (validationResult.status === 'success') {
            if (validationResult.data) {
              acc[field] = validationResult.data;
            }
          }
          if (validationResult.status === 'error') {
            errors[field] = validationResult as TRetrieveError<ReturnType<ValidatorsSchema[keyof ValidatorsSchema]>>;
            overallErrorMessage = `${overallErrorMessage} ${String(field)}: ${validationResult?.message}.`;
          }
          return acc;
        }, {} as { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] });
      const errorsEntries = Object.entries(errors);
      if (errorsEntries.length) {
        return new ErrorResult(
          `Object validation failed for the following fields: ${overallErrorMessage}`,
          errors as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> },
        ) as IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>;
      }
      return new SuccessResult(result) as ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

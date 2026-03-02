import { TObjectEntries } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TValidator } from '../types/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import isObject, { TIsObjectValidationError } from '../rules/isObject';

export type TObjectValidatorsSchema = Record<string, TValidator>;

const DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Object validation failed for the following fields';
const DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ':';
const DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR = ':';

export type TCreateObjectRuleParams<ValidatorsSchema extends TObjectValidatorsSchema> = {
  proxyPerField?: (
    result: ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
    | TRetrieveError<ReturnType<ValidatorsSchema[keyof ValidatorsSchema]>>,
    field: string,
  ) => void,
  errorMessageHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageFieldSeparator?: string,
};

export default function createObjectValidationRule<
  const ValidatorsSchema extends TObjectValidatorsSchema,
>(validatorsSchema: ValidatorsSchema, params?: TCreateObjectRuleParams<ValidatorsSchema>) {
  const schemaEntries = Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>;
  return (
    value: Record<string | symbol, any> & { length?: never },
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
        errorMessage: '',
        isError: false,
      };

      const result = schemaEntries.reduce((acc, [field, fieldValidator]) => {
        const validationResult = fieldValidator(objectValue[String(field)]);
        if (validationResult.status === 'success') {
          acc.validResults[field] = validationResult.data;
          params?.proxyPerField?.(validationResult, String(field));
        } else {
          acc.isError = true;
          acc.errors[field] = validationResult as TRetrieveError<ReturnType<ValidatorsSchema[typeof field]>>;
          params?.proxyPerField?.(validationResult as TRetrieveError<ReturnType<ValidatorsSchema[keyof ValidatorsSchema]>>, String(field));
          acc.errorMessage += `${String(field)}${params?.errorMessageFieldSeparator || DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR} ${validationResult.message}`;
        }
        return acc;
      }, initialAcc);

      if (result.isError) {
        return new ErrorResult(
          `${params?.errorMessageHypernym || DEFAULT_ERROR_MESSAGE_HYPERNYM}${params?.errorMessageHypernymSeparator || DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}\n${result.errorMessage}`,
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

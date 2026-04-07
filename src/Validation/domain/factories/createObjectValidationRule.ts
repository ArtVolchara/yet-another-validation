import { TObjectEntries } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TValidationParams, TValidator } from '../types/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import isObject from '../rules/isObject';

export type TObjectValidatorsSchema = Record<string, TValidator>;

export const OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Object validation failed for the following fields';
export const OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ':';
export const OBJECT_DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR = ':';

export type TObjectValidationErrorResult<ValidatorsSchema extends TObjectValidatorsSchema> = (
  [{ [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }[keyof ValidatorsSchema]] extends [never]
    ? never
    : IError<string, { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>) & {};

export type TCreateObjectRuleParams = {
  errorMessageHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageFieldSeparator?: string,
};

type TObjectValidationRuleResult<
  ValidatorsSchema extends TObjectValidatorsSchema,
  Params extends TValidationParams | undefined = undefined,
> = [NonNullable<Params>['shouldReturnError']] extends [never]
  ? ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  | TObjectValidationErrorResult<ValidatorsSchema>
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TObjectValidationErrorResult<ValidatorsSchema>
    : ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
    | TObjectValidationErrorResult<ValidatorsSchema>;

export default function createObjectValidationRule<const ValidatorsSchema extends TObjectValidatorsSchema>(
  validatorsSchema: ValidatorsSchema,
  params?: TCreateObjectRuleParams,
) {
  const schemaEntries = Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>;
  return <Params extends TValidationParams | undefined = undefined>(
    value: Record<string | symbol, any> & { length?: never },
    validationParams?: Params,
  ): TObjectValidationRuleResult<ValidatorsSchema, Params> => {
    try {
      const initialAcc = {
        validResults: {} as { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] },
        errors: {} as { [Key in keyof ValidatorsSchema]: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> },
        errorMessage: '',
        isError: false,
      };

      const result = schemaEntries.reduce((acc, [field, fieldValidator]) => {
        const validationResult = fieldValidator(value?.[field as keyof typeof value], {
          key: field,
          path: validationParams?.path ? `${(validationParams?.path)}.${String(field)}` : String(field),
          shouldReturnError: isObject(value).status === 'error' || validationParams?.shouldReturnError,
        });
        if (validationResult.status === 'success') {
          acc.validResults[field] = validationResult.data;
        } else {
          acc.isError = true;
          acc.errors[field] = validationResult as TRetrieveError<ReturnType<ValidatorsSchema[typeof field]>>;
          acc.errorMessage += `\n${String(field)}${params?.errorMessageFieldSeparator || OBJECT_DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR} ${validationResult.message}`;
        }
        return acc;
      }, initialAcc);

      if (result.isError) {
        return new ErrorResult(
          `${params?.errorMessageHypernym || OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM}${params?.errorMessageHypernymSeparator || OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}${result.errorMessage}`,
          result.errors,
        ) as TObjectValidationErrorResult<ValidatorsSchema>;
      }
      return new SuccessResult(result.validResults) as TObjectValidationRuleResult<ValidatorsSchema, Params>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

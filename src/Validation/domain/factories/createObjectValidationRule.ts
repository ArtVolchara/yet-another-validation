import { TObjectEntries, TOverrideParams, TRemoveReadonly } from '../../../_Root/domain/types/utils';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult, SuccessResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TValidationParams, TValidator } from '../entities/TValidator';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import { isObject } from '../rules';

export type TObjectValidatorsSchema = Record<string, TValidator>;

export const OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Object validation failed for the following fields';
export const OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ': ';
export const OBJECT_DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR = ': ';

export type TCreateObjectRuleParams = TValidationParams & {
  errorMessageHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageFieldSeparator?: string,
};

type TResolvedObjectValidationParams<
  CreateParams extends TCreateObjectRuleParams | undefined,
  CallParams extends TValidationParams | undefined,
> = TOverrideParams<CreateParams, CallParams, 'shouldReturnError'>;

type TObjectValidationRuleResult<
  ValidatorsSchema extends TObjectValidatorsSchema,
  Params extends TValidationParams | undefined = undefined,
> = [NonNullable<Params>['shouldReturnError']] extends [never]
  ? ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
  // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias 
  | IError<string, { [Key in keyof ValidatorsSchema]?: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
  & { valid: { [Key in keyof ValidatorsSchema]?: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] } }
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
    ? [IError<string, { [Key in keyof ValidatorsSchema]?: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
    & { valid: { [Key in keyof ValidatorsSchema]?: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] } }] extends [never]
      ? ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
        // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
      : IError<string, { [Key in keyof ValidatorsSchema]?: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
      & { valid: { [Key in keyof ValidatorsSchema]?: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] } }
    : ISuccess<{ [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] }>
      // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
    | IError<string, { [Key in keyof ValidatorsSchema]?: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
    & { valid: { [Key in keyof ValidatorsSchema]?: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] } };

export default function createObjectValidationRule<
  const Schema extends TObjectValidatorsSchema,
  const ValidatorsSchema extends TRemoveReadonly<Schema> = TRemoveReadonly<Schema>,
  const Params extends TCreateObjectRuleParams | undefined = undefined,
>(
  validatorsSchema: Schema,
  params?: Params,
) {
  const schemaEntries = Object.entries(validatorsSchema) as TObjectEntries<typeof validatorsSchema>;
  return <CallParams extends TValidationParams | undefined = undefined>(
    value: Record<string | symbol, any> & { length?: never },
    validationParams?: CallParams,
  ): TObjectValidationRuleResult<ValidatorsSchema, TResolvedObjectValidationParams<Params, CallParams>> => {
    try {
      const initialAcc = {
        validResults: {} as { [Key in keyof ValidatorsSchema]: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] },
        errors: {} as { [Key in keyof ValidatorsSchema]?: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> },
        errorMessage: '',
        isError: false,
      };
      const shouldReturnError = validationParams?.shouldReturnError ?? params?.shouldReturnError;

      const result = schemaEntries.reduce((acc, [field, fieldValidator]) => {
        const validationResult = fieldValidator(value?.[field as keyof typeof value], {
          shouldReturnError: isObject(value).status === 'error' || shouldReturnError,
        });
        if (validationResult.status === 'success') {
          acc.validResults[field] = validationResult.data;
        } else {
          acc.isError = true;
          acc.errors[field] = validationResult as TRetrieveError<ReturnType<ValidatorsSchema[typeof field]>>;
          acc.errorMessage += `\n${String(field)}${params?.errorMessageFieldSeparator || OBJECT_DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}${validationResult.message}`;
        }
        return acc;
      }, initialAcc);

      if (result.isError) {
        const errorResult = new ErrorResult(
          `${params?.errorMessageHypernym || OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM}${params?.errorMessageHypernymSeparator || OBJECT_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}${result.errorMessage}`,
          result.errors,
        ) as IError<string, { [Key in keyof ValidatorsSchema]?: TRetrieveError<ReturnType<ValidatorsSchema[Key]>> }>
        & { valid: { [Key in keyof ValidatorsSchema]?: TRetrieveSuccess<ReturnType<ValidatorsSchema[Key]>>['data'] } };
        errorResult.valid = result.validResults;
        return errorResult as TObjectValidationRuleResult<ValidatorsSchema, TResolvedObjectValidationParams<Params, CallParams>>;
      }
      return new SuccessResult(result.validResults) as TObjectValidationRuleResult<ValidatorsSchema, TResolvedObjectValidationParams<Params, CallParams>>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

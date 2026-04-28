import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccess,
  TValidationParams,
  TValidator,
} from '../types/TValidator';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult, SuccessResult } from '../../../_Root/domain/factories';
import { isArray } from '../rules';

export const ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Array validation failed for the following elements';
export const ARRAY_DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM = 'Array does not consist of elements following next validation rules';
export const ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ': ';
export const DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR = ': ';

export type TValidationAccumulator<Validator extends TValidator> = {
  validResults: Array<TRetrieveValidationSuccess<Validator>>;
  errors: Array<TRetrieveError<ReturnType<Validator>> | undefined>;
  errorMessage: string;
  isError: boolean;
};

export type TCreateArrayRuleParams = {
  errorMessageHypernym?: string,
  errorMessageEmptyHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageIndexSeparator?: string,
};

type TArrayValidationRuleResult<
  Validator extends TValidator,
  Params extends TValidationParams | undefined = undefined,
> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? ISuccess<Array<TRetrieveValidationSuccess<Validator>['data']>>
    | IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>
      : ISuccess<Array<TRetrieveValidationSuccess<Validator>['data']>>
      | IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>;

export default function createArrayValidationRule<
  const Validator extends TValidator,
>(
  validator: Validator,
  params?: TCreateArrayRuleParams,
) {
  return <Params extends TValidationParams | undefined = undefined>(
    value: Array<TRetrieveValidationInputData<Validator>>,
    validationParams?: Params,
  ): TArrayValidationRuleResult<Validator, Params> => {
    try {
      const initialAcc: TValidationAccumulator<Validator> = {
        validResults: [],
        errors: [],
        errorMessage: '',
        isError: false,
      };
      if (isArray(value).status === 'error'
      || (isArray(value).status === 'success' && value.length === 0 && validationParams?.shouldReturnError)
      ) {
        const validationResult = validator(undefined, { shouldReturnError: true });
        if (validationResult.status === 'error') {
          return new ErrorResult(
            `${params?.errorMessageEmptyHypernym || ARRAY_DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM}${params?.errorMessageHypernymSeparator || ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}\n${validationResult.message}`,
            [],
          ) as TArrayValidationRuleResult<Validator, Params>;
        }
      }
      const result = value?.reduce((acc, item, index) => {
        const validationResult = validator(item, {
          key: index,
          shouldReturnError: validationParams?.shouldReturnError,
        });
        if (validationResult.status === 'success') {
          acc.validResults.push(validationResult.data);
          acc.errors.push(undefined);
        } else {
          acc.isError = true;
          acc.errors.push(validationResult as TRetrieveError<ReturnType<Validator>>);
          acc.errorMessage += `${index}${params?.errorMessageIndexSeparator || DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}${validationResult.message}\n`;
        }
        return acc;
      }, initialAcc);
      if (result.isError) {
        return new ErrorResult(
          `${params?.errorMessageHypernym || ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${params?.errorMessageHypernymSeparator || ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}\n${result.errorMessage}`,
          result.errors,
        ) as TArrayValidationRuleResult<Validator, Params>;
      }
      return new SuccessResult(result.validResults) as TArrayValidationRuleResult<Validator, Params>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

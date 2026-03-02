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

const DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Array validation failed for the following elements';
const DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ':';
const DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR = ':';

export type TValidationAccumulator<Validator extends TValidator> = {
  validResults: Array<TRetrieveValidationSuccessData<Validator>>;
  errors: Array<TRetrieveError<ReturnType<Validator>> | undefined>;
  errorMessage: string;
  isError: boolean;
};

export type TCreateArrayRuleParams<Validator extends TValidator> = {
  proxyPerElement?: (
    result: ISuccess<TRetrieveValidationSuccessData<Validator>['data']> 
    | TRetrieveError<ReturnType<Validator>> | undefined,
    index: number,
  ) => void,
  errorMessageHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageIndexSeparator?: string,
};

export default function createArrayValidationRule<
  const Validator extends TValidator,
>(
  validator: Validator,
  params?: TCreateArrayRuleParams<Validator>,
) {
  return (
    value: Array<TRetrieveValidationInputData<Validator>>,
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
        errorMessage: '',
        isError: false,
      };

      const result = value.reduce((acc, item, index) => {
        const validationResult = validator(item);
        if (validationResult.status === 'success') {
          acc.validResults.push(validationResult.data);
          acc.errors.push(undefined);
          params?.proxyPerElement?.(validationResult, index);
        } else {
          acc.isError = true;
          acc.errors.push(validationResult as TRetrieveError<ReturnType<Validator>>);
          params?.proxyPerElement?.(validationResult as TRetrieveError<ReturnType<Validator>>, index);
          acc.errorMessage += `${index}${params?.errorMessageIndexSeparator || DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}${validationResult.message}\n`;
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
      throw e;
    }
  };
}

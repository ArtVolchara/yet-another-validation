/* eslint-disable max-len */
import {
  TRetrieveErrorData,
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidationParams,
  TValidator,
  TValidators,
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import isArray from '../rules/isArray';

export const DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Tuple validation failed for the following elements';
export const DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM = 'Tuple does not consist of elements following next validation rules';
export const DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ':';
export const DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR = ':';

export type TInputValue<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationInputData<First>]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationInputData<First>, ...TInputValue<Rest>]
    : [];

export type TSuccessTupleValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationSuccessData<First>['data']]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationSuccessData<First>['data'], ...TSuccessTupleValidationData<Rest>]
    : [];

export type TErrorTupleValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveErrorData<First> | undefined]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveErrorData<First> | undefined, ...TErrorTupleValidationData<Rest>]
    : [];

type TValidationAccumulator<Validators extends TValidators> = {
  validResults: TSuccessTupleValidationData<Validators>;
  errors: TErrorTupleValidationData<Validators>;
  errorMessage: string,
  isError: boolean;
};

export type TCreateTupleRuleParams = {
  errorMessageHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageIndexSeparator?: string,
};

type TTupleValidationRuleResult<
  Validators extends TValidators,
  Params extends TValidationParams | undefined = undefined,
> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? ISuccess<TSuccessTupleValidationData<Validators>>
    | IError<string, TErrorTupleValidationData<Validators>>
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? IError<string, TErrorTupleValidationData<Validators>>
      : ISuccess<TSuccessTupleValidationData<Validators>>
      | IError<string, TErrorTupleValidationData<Validators>>;

export default function createTupleValidationRule<const Validators extends TValidators>(
  validators: Validators,
  params?: TCreateTupleRuleParams,
) {
  return <Params extends TValidationParams | undefined = undefined>(
    value: Array<(TInputValue<Validators>)[number]> | Readonly<Array<(TInputValue<Validators>)[number]>>,
    validationParams?: Params,
  ): TTupleValidationRuleResult<Validators, Params> => {
    try {
      const initialAcc: TValidationAccumulator<Validators> = {
        validResults: [] as unknown as TSuccessTupleValidationData<Validators>,
        errors: [] as unknown as TErrorTupleValidationData<Validators>,
        errorMessage: '',
        isError: false,
      };

      const result = initialAcc;
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, validator] of validators.entries()) {
      // eslint-disable-next-line no-continue
        if (!validator) continue;

        const validationResult = validator(value?.[index], {
          key: index,
          shouldReturnError: isArray(value).status === 'error' || validationParams?.shouldReturnError,
          path: validationParams?.path ? `${(validationParams?.path)}[${String(index)}]` : `[${String(index)}]`,
        });

        if (validationResult.status === 'success') {
          result.validResults[index] = validationResult.data;
          result.errors[index] = undefined;
        } else {
          result.isError = true;
          result.errors[index] = validationResult;
          result.errorMessage += `${index}${params?.errorMessageIndexSeparator || DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}${validationResult.message}\n`;
        }
      }

      if (result.isError) {
        return new ErrorResult(
          `${params?.errorMessageHypernym || DEFAULT_ERROR_MESSAGE_HYPERNYM}${params?.errorMessageHypernymSeparator || DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}\n${result.errorMessage}`,
          result.errors,
        ) as TTupleValidationRuleResult<Validators, Params>;
      }
      return new SuccessResult(result.validResults) as TTupleValidationRuleResult<Validators, Params>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

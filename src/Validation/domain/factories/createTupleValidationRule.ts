/* eslint-disable max-len */
import {
  TRetrieveValidationError,
  TRetrieveValidationInputData,
  TRetrieveValidationSuccess,
  TValidationParams,
  TValidator,
  TValidators,
} from '../entities/TValidator';
import { TOverrideParams } from '../../../_Root/domain/types/utils';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult, SuccessResult } from '../../../_Root/domain/factories';
import { isArray } from '../rules';

export const TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM = 'Tuple validation failed for the following elements';
export const TUPLE_DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM = 'Tuple does not consist of elements following next validation rules';
export const TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR = ': ';
export const TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR = ': ';

export type TInputValue<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationInputData<First>]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationInputData<First>, ...TInputValue<Rest>]
    : [];

export type TSuccessTupleValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationSuccess<First>['data']]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationSuccess<First>['data'], ...TSuccessTupleValidationData<Rest>]
    : [];

export type TErrorTupleValidationData<Validators extends Partial<TValidators>> = Validators extends [infer First extends TValidator]
  ? [TRetrieveValidationError<First> | undefined]
  : Validators extends [
    infer First extends TValidator,
    ...infer Rest extends TValidators,
  ]
    ? [TRetrieveValidationError<First> | undefined, ...TErrorTupleValidationData<Rest>]
    : [];

type TValidationAccumulator<Validators extends TValidators> = {
  validResults: TSuccessTupleValidationData<Validators>;
  errors: TErrorTupleValidationData<Validators>;
  errorMessage: string,
  isError: boolean;
};

export type TCreateTupleRuleParams = TValidationParams & {
  errorMessageHypernym?: string,
  errorMessageHypernymSeparator?: string,
  errorMessageIndexSeparator?: string,
};

type TResolvedTupleValidationParams<
  CreateParams extends TCreateTupleRuleParams | undefined,
  CallParams extends TValidationParams | undefined,
> = TOverrideParams<CreateParams, CallParams, 'shouldReturnError'>;

type TTupleValidationRuleResult<
  Validators extends TValidators,
  Params extends TValidationParams | undefined = undefined,
> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? ISuccess<TSuccessTupleValidationData<Validators>>
    // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
    | IError<string, TErrorTupleValidationData<Validators>>
    & { valid: Partial<TSuccessTupleValidationData<Validators>> }
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
      ? IError<string, TErrorTupleValidationData<Validators>> & { valid: Partial<TSuccessTupleValidationData<Validators>> }
      : ISuccess<TSuccessTupleValidationData<Validators>>
      // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
      | IError<string, TErrorTupleValidationData<Validators>> & { valid: Partial<TSuccessTupleValidationData<Validators>> };

export default function createTupleValidationRule<
  const Validators extends TValidators,
  const Params extends TCreateTupleRuleParams | undefined = undefined,
>(
  validators: Validators,
  params?: Params,
) {
  return <CallParams extends TValidationParams | undefined = undefined>(
    value: Array<(TInputValue<Validators>)[number]> | Readonly<Array<(TInputValue<Validators>)[number]>>,
    validationParams?: CallParams,
  ): TTupleValidationRuleResult<Validators, TResolvedTupleValidationParams<Params, CallParams>> => {
    try {
      const initialAcc: TValidationAccumulator<Validators> = {
        validResults: [] as unknown as TSuccessTupleValidationData<Validators>,
        errors: [] as unknown as TErrorTupleValidationData<Validators>,
        errorMessage: '',
        isError: false,
      };
      const shouldReturnError = validationParams?.shouldReturnError ?? params?.shouldReturnError;

      const result = initialAcc;
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, validator] of validators.entries()) {
      // eslint-disable-next-line no-continue
        if (!validator) continue;

        const validationResult = validator(value?.[index], {
          shouldReturnError: isArray(value).status === 'error' || shouldReturnError,
        });

        if (validationResult.status === 'success') {
          result.validResults[index] = validationResult.data;
          result.errors[index] = undefined;
        } else {
          result.isError = true;
          result.errors[index] = validationResult;
          result.errorMessage += `${index}${params?.errorMessageIndexSeparator || TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}${validationResult.message}\n`;
        }
      }

      if (result.isError) {
        const errorResult = new ErrorResult(
          `${params?.errorMessageHypernym || TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${params?.errorMessageHypernymSeparator || TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}\n${result.errorMessage}`,
          result.errors,
          // если вынести в отдельный тип - тайпскрипт будет выводить нечитаемый type alias
        ) as unknown as IError<string, TErrorTupleValidationData<Validators>> & { valid: Partial<TSuccessTupleValidationData<Validators>> };
        errorResult.valid = result.validResults;
        return errorResult as TTupleValidationRuleResult<Validators, TResolvedTupleValidationParams<Params, CallParams>>;
      }
      return new SuccessResult(result.validResults) as TTupleValidationRuleResult<Validators, TResolvedTupleValidationParams<Params, CallParams>>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

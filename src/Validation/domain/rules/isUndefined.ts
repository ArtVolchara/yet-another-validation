import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_UNDEFINED_ERROR_MESSAGE = 'Value should be undefined' as const;

export type TIsUndefinedValidationError = IError<typeof IS_UNDEFINED_ERROR_MESSAGE, undefined>;
export type TIsUndefinedValidationSuccess = ISuccess<undefined>;

type TIsUndefinedValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsUndefinedValidationSuccess | TIsUndefinedValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsUndefinedValidationError
    : TIsUndefinedValidationSuccess | TIsUndefinedValidationError;

export default function isUndefined<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsUndefinedValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined) as TIsUndefinedValidationResult<Params>;
  }
  try {
    if (value === undefined) {
      return new SuccessResult(undefined) as TIsUndefinedValidationResult<Params>;
    }
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined) as TIsUndefinedValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined) as TIsUndefinedValidationResult<Params>;
  }
}

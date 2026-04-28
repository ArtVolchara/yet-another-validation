import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_FUNCTION_ERROR_MESSAGE = 'Value should be function' as const;

export type TIsFunctionValidationError = IError<typeof IS_FUNCTION_ERROR_MESSAGE, undefined>;
export type TIsFunctionValidationSuccess = ISuccess<Function>;

type TIsFunctionValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsFunctionValidationSuccess | TIsFunctionValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsFunctionValidationError
    : TIsFunctionValidationSuccess | TIsFunctionValidationError;

export default function isFunction<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsFunctionValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_FUNCTION_ERROR_MESSAGE, undefined) as TIsFunctionValidationResult<Params>;
  }
  try {
    if (typeof value === 'function') {
      return new SuccessResult(value) as TIsFunctionValidationResult<Params>;
    }
    return new ErrorResult(IS_FUNCTION_ERROR_MESSAGE, undefined) as TIsFunctionValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_FUNCTION_ERROR_MESSAGE, undefined) as TIsFunctionValidationResult<Params>;
  }
}

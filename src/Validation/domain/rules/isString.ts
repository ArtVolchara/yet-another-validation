import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_STRING_ERROR_MESSAGE = 'Value should be string' as const;
export type TIsStringValidationSuccess = ISuccess<string>;
export type TIsStringValidationDefaultError = IError<typeof IS_STRING_ERROR_MESSAGE, undefined>;

type TIsStringValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsStringValidationSuccess | TIsStringValidationDefaultError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsStringValidationDefaultError
    : TIsStringValidationSuccess | TIsStringValidationDefaultError;

export default function isString<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsStringValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined) as TIsStringValidationResult<Params>;
  }
  try {
    if (typeof value === 'string') {
      return new SuccessResult(value) as TIsStringValidationResult<Params>;
    }
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined) as TIsStringValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined) as TIsStringValidationResult<Params>;
  }
}

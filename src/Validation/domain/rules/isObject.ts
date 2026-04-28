import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult, SuccessResult } from '../../../_Root/domain/factories';
import type { TValidationParams } from '../types/TValidator';

export const IS_OBJECT_ERROR_MESSAGE = 'Value should be object' as const;

export type TIsObjectValidationError = IError<typeof IS_OBJECT_ERROR_MESSAGE, undefined>;
export type TIsObjectValidationSuccess = ISuccess<Record<string | symbol, any>>;

type TIsObjectValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsObjectValidationSuccess | TIsObjectValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsObjectValidationError
    : TIsObjectValidationSuccess | TIsObjectValidationError;

export default function isObject<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsObjectValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_OBJECT_ERROR_MESSAGE, undefined) as TIsObjectValidationResult<Params>;
  }
  try {
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Object]' &&
      !Array.isArray(value)
    ) {
      return new SuccessResult(value as Record<string, any>) as TIsObjectValidationResult<Params>;
    }
    return new ErrorResult(IS_OBJECT_ERROR_MESSAGE, undefined) as TIsObjectValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_OBJECT_ERROR_MESSAGE, undefined) as TIsObjectValidationResult<Params>;
  }
}

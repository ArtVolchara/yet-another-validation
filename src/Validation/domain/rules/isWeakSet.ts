import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_WEAK_SET_ERROR_MESSAGE = 'Value should be WeakSet' as const;

export type TIsWeakSetValidationError = IError<typeof IS_WEAK_SET_ERROR_MESSAGE, undefined>;
export type TIsWeakSetValidationSuccess = ISuccess<WeakSet<object>>;

type TIsWeakSetValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsWeakSetValidationSuccess | TIsWeakSetValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsWeakSetValidationError
    : TIsWeakSetValidationSuccess | TIsWeakSetValidationError;

export default function isWeakSet<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsWeakSetValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined) as TIsWeakSetValidationResult<Params>;
  }
  try {
    if (value instanceof WeakSet) {
      return new SuccessResult(value as WeakSet<object>) as TIsWeakSetValidationResult<Params>;
    }
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined) as TIsWeakSetValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined) as TIsWeakSetValidationResult<Params>;
  }
}

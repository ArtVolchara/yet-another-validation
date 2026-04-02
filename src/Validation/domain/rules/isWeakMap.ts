import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_WEAK_MAP_ERROR_MESSAGE = 'Value should be a WeakMap' as const;

export type TIsWeakMapValidationError = IError<typeof IS_WEAK_MAP_ERROR_MESSAGE, undefined>;
export type TIsWeakMapValidationSuccess = ISuccess<WeakMap<object, unknown>>;

type TIsWeakMapValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsWeakMapValidationSuccess | TIsWeakMapValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsWeakMapValidationError
    : TIsWeakMapValidationSuccess | TIsWeakMapValidationError;

export default function isWeakMap<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsWeakMapValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined) as TIsWeakMapValidationResult<Params>;
  }
  try {
    if (value instanceof WeakMap) {
      return new SuccessResult(value as WeakMap<object, unknown>) as TIsWeakMapValidationResult<Params>;
    }
    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined) as TIsWeakMapValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined) as TIsWeakMapValidationResult<Params>;
  }
}

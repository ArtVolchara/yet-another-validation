import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_WEAK_MAP_ERROR_MESSAGE = 'Value should be a WeakMap' as const;

export type TIsWeakMapValidationError = IError<typeof IS_WEAK_MAP_ERROR_MESSAGE, undefined>;
export type TIsWeakMapValidationSuccess = ISuccess<WeakMap<object, unknown>>;

export default function isWeakMap(value: unknown): TIsWeakMapValidationSuccess | TIsWeakMapValidationError {
  try {
    if (value instanceof WeakMap) {
      return new SuccessResult(value as WeakMap<object, unknown>);
    }

    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined);
  }
} 
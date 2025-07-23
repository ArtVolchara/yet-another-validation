import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_WEAK_SET_ERROR_MESSAGE = 'Value should be WeakSet' as const;

export type TIsWeakSetValidationError = IError<typeof IS_WEAK_SET_ERROR_MESSAGE, undefined>;
export type TIsWeakSetValidationSuccess = ISuccess<WeakSet<object>>;

export default function isWeakSet(value: any): TIsWeakSetValidationSuccess | TIsWeakSetValidationError {
  try {
    if (value instanceof WeakSet) {
      return new SuccessResult(value as WeakSet<object>);
    }
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined);
  }
}


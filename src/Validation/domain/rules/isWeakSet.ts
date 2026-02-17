import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_WEAK_SET_ERROR_MESSAGE = 'Value should be WeakSet' as const;

export type TIsWeakSetValidationError = IError<typeof IS_WEAK_SET_ERROR_MESSAGE, undefined>;
export type TIsWeakSetValidationSuccess = ISuccess<WeakSet<object>>;

export default function isWeakSet<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsWeakSetValidationSuccess | Error;

export default function isWeakSet(
  value: any
): TIsWeakSetValidationSuccess | TIsWeakSetValidationError;

export default function isWeakSet<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsWeakSetValidationSuccess | TIsWeakSetValidationError)
  : (TIsWeakSetValidationSuccess | Error)
= undefined extends Error
  ? (TIsWeakSetValidationSuccess | TIsWeakSetValidationError)
  : (TIsWeakSetValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isWeakSet(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof WeakSet) {
      return new SuccessResult(value as WeakSet<object>);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_WEAK_SET_ERROR_MESSAGE, undefined);
  }
}


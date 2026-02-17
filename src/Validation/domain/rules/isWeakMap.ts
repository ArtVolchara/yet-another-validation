import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_WEAK_MAP_ERROR_MESSAGE = 'Value should be a WeakMap' as const;

export type TIsWeakMapValidationError = IError<typeof IS_WEAK_MAP_ERROR_MESSAGE, undefined>;
export type TIsWeakMapValidationSuccess = ISuccess<WeakMap<object, unknown>>;

export default function isWeakMap<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsWeakMapValidationSuccess | Error;

export default function isWeakMap(
  value: any
): TIsWeakMapValidationSuccess | TIsWeakMapValidationError;

export default function isWeakMap<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsWeakMapValidationSuccess | TIsWeakMapValidationError)
  : (TIsWeakMapValidationSuccess | Error)
= undefined extends Error
  ? (TIsWeakMapValidationSuccess | TIsWeakMapValidationError)
  : (TIsWeakMapValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isWeakMap(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof WeakMap) {
      return new SuccessResult(value as WeakMap<object, unknown>);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_WEAK_MAP_ERROR_MESSAGE, undefined);
  }
} 
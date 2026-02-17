import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_INT8_ARRAY_ERROR_MESSAGE = 'Value should be Int8Array' as const;

export type TIsInt8ArrayValidationError = IError<typeof IS_INT8_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsInt8ArrayValidationSuccess = ISuccess<Int8Array>;

export default function isInt8Array<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsInt8ArrayValidationSuccess | Error;

export default function isInt8Array(
  value: any
): TIsInt8ArrayValidationSuccess | TIsInt8ArrayValidationError;

export default function isInt8Array<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsInt8ArrayValidationSuccess | TIsInt8ArrayValidationError)
  : (TIsInt8ArrayValidationSuccess | Error)
= undefined extends Error
  ? (TIsInt8ArrayValidationSuccess | TIsInt8ArrayValidationError)
  : (TIsInt8ArrayValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

/**
 * Checks if the value is an Int8Array
 * @param value - The value to check
 * @returns SuccessResult with the Int8Array if valid, ErrorResult otherwise
 */
export default function isInt8Array(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Int8Array) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_INT8_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_INT8_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_INT32_ARRAY_ERROR_MESSAGE = 'Value should be Int32Array' as const;

export type TIsInt32ArrayValidationError = IError<typeof IS_INT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsInt32ArrayValidationSuccess = ISuccess<Int32Array>;

/**
 * Checks if the value is an Int32Array
 * @param value - The value to check
 * @returns SuccessResult with the Int32Array if valid, ErrorResult otherwise
 */
export default function isInt32Array(value: unknown): TIsInt32ArrayValidationSuccess | TIsInt32ArrayValidationError {
  try {
    if (value instanceof Int32Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_INT32_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_INT32_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
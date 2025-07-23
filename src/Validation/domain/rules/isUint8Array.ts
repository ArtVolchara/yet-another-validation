import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UINT8_ARRAY_ERROR_MESSAGE = 'Value should be Uint8Array' as const;

export type TIsUint8ArrayValidationError = IError<typeof IS_UINT8_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint8ArrayValidationSuccess = ISuccess<Uint8Array>;

/**
 * Checks if the value is a Uint8Array
 * @param value - The value to check
 * @returns SuccessResult with the Uint8Array if valid, ErrorResult otherwise
 */
export default function isUint8Array(value: any): TIsUint8ArrayValidationSuccess | TIsUint8ArrayValidationError {
  try {
    if (value instanceof Uint8Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
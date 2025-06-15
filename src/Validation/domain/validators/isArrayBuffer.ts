import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_ARRAY_BUFFER_ERROR_MESSAGE = 'Value should be an ArrayBuffer' as const;

export type TIsArrayBufferValidationError = IError<typeof IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined>;
export type TIsArrayBufferValidationSuccess = ISuccess<ArrayBuffer>;

export default function isArrayBuffer(value: unknown): TIsArrayBufferValidationSuccess | TIsArrayBufferValidationError {
  try {
    if (value instanceof ArrayBuffer) {
      return new SuccessResult(value as ArrayBuffer);
    }

    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined);
  }
} 
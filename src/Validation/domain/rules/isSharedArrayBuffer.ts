import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE = 'Value should be a SharedArrayBuffer' as const;

export type TIsSharedArrayBufferValidationError = IError<typeof IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined>;
export type TIsSharedArrayBufferValidationSuccess = ISuccess<SharedArrayBuffer>;

export default function isSharedArrayBuffer(value: unknown): TIsSharedArrayBufferValidationSuccess | TIsSharedArrayBufferValidationError {
  try {
    if (value instanceof SharedArrayBuffer) {
      return new SuccessResult(value as SharedArrayBuffer);
    }

    return new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined);
  }
} 
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_ARRAY_BUFFER_ERROR_MESSAGE = 'Value should be an ArrayBuffer' as const;

export type TIsArrayBufferValidationError = IError<typeof IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined>;
export type TIsArrayBufferValidationSuccess = ISuccess<ArrayBuffer>;

export default function isArrayBuffer<const Error extends IError<string, undefined>>(
  value: unknown,
  error: Error
): TIsArrayBufferValidationSuccess | Error;

export default function isArrayBuffer(
  value: unknown
): TIsArrayBufferValidationSuccess | TIsArrayBufferValidationError;

export default function isArrayBuffer<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsArrayBufferValidationSuccess | TIsArrayBufferValidationError)
  : (TIsArrayBufferValidationSuccess | Error)
= undefined extends Error
  ? (TIsArrayBufferValidationSuccess | TIsArrayBufferValidationError)
  : (TIsArrayBufferValidationSuccess | Error),
>(
  value: unknown,
  error?: Error
): Result;

export default function isArrayBuffer(
  value: unknown,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof ArrayBuffer) {
      return new SuccessResult(value as ArrayBuffer);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined);
  }
} 
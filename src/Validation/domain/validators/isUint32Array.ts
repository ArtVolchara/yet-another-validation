import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UINT32_ARRAY_ERROR_MESSAGE = 'Value should be Uint32Array' as const;

export type TIsUint32ArrayValidationError = IError<typeof IS_UINT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint32ArrayValidationSuccess = ISuccess<Uint32Array>;

export default function isUint32Array(value: unknown): TIsUint32ArrayValidationSuccess | TIsUint32ArrayValidationError {
  try {
    if (value instanceof Uint32Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
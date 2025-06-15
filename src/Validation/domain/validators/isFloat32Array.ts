import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_FLOAT32_ARRAY_ERROR_MESSAGE = 'Value should be Float32Array' as const;

export type TIsFloat32ArrayValidationError = IError<typeof IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsFloat32ArrayValidationSuccess = ISuccess<Float32Array>;

export default function isFloat32Array(value: unknown): TIsFloat32ArrayValidationSuccess | TIsFloat32ArrayValidationError {
  try {
    if (value instanceof Float32Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
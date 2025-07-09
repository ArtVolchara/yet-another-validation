import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_FLOAT64_ARRAY_ERROR_MESSAGE = 'Value should be Float64Array' as const;

export type TIsFloat64ArrayValidationError = IError<typeof IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsFloat64ArrayValidationSuccess = ISuccess<Float64Array>;

export default function isFloat64Array(value: unknown): TIsFloat64ArrayValidationSuccess | TIsFloat64ArrayValidationError {
  try {
    if (value instanceof Float64Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_BIGINT64_ARRAY_ERROR_MESSAGE = 'Value should be BigInt64Array' as const;

export type TIsBigInt64ArrayValidationError = IError<typeof IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsBigInt64ArrayValidationSuccess = ISuccess<BigInt64Array>;

export default function isBigInt64Array(value: unknown): TIsBigInt64ArrayValidationSuccess | TIsBigInt64ArrayValidationError {
  try {
    if (value instanceof BigInt64Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
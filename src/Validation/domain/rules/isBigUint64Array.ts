import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_BIGUINT64_ARRAY_ERROR_MESSAGE = 'Value should be BigUint64Array' as const;

export type TIsBigUint64ArrayValidationError = IError<typeof IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsBigUint64ArrayValidationSuccess = ISuccess<BigUint64Array>;

export default function isBigUint64Array(value: unknown): TIsBigUint64ArrayValidationSuccess | TIsBigUint64ArrayValidationError {
  try {
    if (value instanceof BigUint64Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
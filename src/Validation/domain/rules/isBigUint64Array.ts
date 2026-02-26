import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_BIGUINT64_ARRAY_ERROR_MESSAGE = 'Value should be BigUint64Array' as const;

export type TIsBigUint64ArrayValidationError = IError<typeof IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsBigUint64ArrayValidationSuccess = ISuccess<BigUint64Array>;

export default function isBigUint64Array<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsBigUint64ArrayValidationSuccess | Error;

export default function isBigUint64Array(
  value: any
): TIsBigUint64ArrayValidationSuccess | TIsBigUint64ArrayValidationError;

export default function isBigUint64Array<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: any,
  error?: Error
): undefined extends Error
  ? (TIsBigUint64ArrayValidationSuccess | TIsBigUint64ArrayValidationError)
  : (TIsBigUint64ArrayValidationSuccess | Error);

export default function isBigUint64Array(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof BigUint64Array) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
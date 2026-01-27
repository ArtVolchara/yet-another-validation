import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_BIGINT64_ARRAY_ERROR_MESSAGE = 'Value should be BigInt64Array' as const;

export type TIsBigInt64ArrayValidationError = IError<typeof IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsBigInt64ArrayValidationSuccess = ISuccess<BigInt64Array>;

export default function isBigInt64Array<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsBigInt64ArrayValidationSuccess | Error;

export default function isBigInt64Array(
  value: any
): TIsBigInt64ArrayValidationSuccess | TIsBigInt64ArrayValidationError;

export default function isBigInt64Array(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof BigInt64Array) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined);
  }
}

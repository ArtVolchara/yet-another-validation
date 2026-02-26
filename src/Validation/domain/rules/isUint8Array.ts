import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UINT8_ARRAY_ERROR_MESSAGE = 'Value should be Uint8Array' as const;

export type TIsUint8ArrayValidationError = IError<typeof IS_UINT8_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint8ArrayValidationSuccess = ISuccess<Uint8Array>;

export default function isUint8Array<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsUint8ArrayValidationSuccess | Error;

export default function isUint8Array(
  value: any
): TIsUint8ArrayValidationSuccess | TIsUint8ArrayValidationError;

export default function isUint8Array<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: any,
  error?: Error
): undefined extends Error
  ? (TIsUint8ArrayValidationSuccess | TIsUint8ArrayValidationError)
  : (TIsUint8ArrayValidationSuccess | Error);

export default function isUint8Array(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Uint8Array) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
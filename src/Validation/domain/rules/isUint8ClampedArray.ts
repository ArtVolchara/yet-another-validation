import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE = 'Value should be Uint8ClampedArray' as const;

export type TIsUint8ClampedArrayValidationError = IError<typeof IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint8ClampedArrayValidationSuccess = ISuccess<Uint8ClampedArray>;

export default function isUint8ClampedArray<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsUint8ClampedArrayValidationSuccess | Error;

export default function isUint8ClampedArray(
  value: any
): TIsUint8ClampedArrayValidationSuccess | TIsUint8ClampedArrayValidationError;

export default function isUint8ClampedArray<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: any,
  error?: Error
): undefined extends Error
  ? (TIsUint8ClampedArrayValidationSuccess | TIsUint8ClampedArrayValidationError)
  : (TIsUint8ClampedArrayValidationSuccess | Error);

export default function isUint8ClampedArray(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Uint8ClampedArray) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined);
  }
}

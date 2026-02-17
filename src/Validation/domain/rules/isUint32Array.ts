import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UINT32_ARRAY_ERROR_MESSAGE = 'Value should be Uint32Array' as const;

export type TIsUint32ArrayValidationError = IError<typeof IS_UINT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint32ArrayValidationSuccess = ISuccess<Uint32Array>;

export default function isUint32Array<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsUint32ArrayValidationSuccess | Error;

export default function isUint32Array(
  value: any
): TIsUint32ArrayValidationSuccess | TIsUint32ArrayValidationError;

export default function isUint32Array<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsUint32ArrayValidationSuccess | TIsUint32ArrayValidationError)
  : (TIsUint32ArrayValidationSuccess | Error)
= undefined extends Error
  ? (TIsUint32ArrayValidationSuccess | TIsUint32ArrayValidationError)
  : (TIsUint32ArrayValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isUint32Array(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Uint32Array) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
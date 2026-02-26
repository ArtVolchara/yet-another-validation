import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_INT16_ARRAY_ERROR_MESSAGE = 'Value should be Int16Array' as const;

export type TIsInt16ArrayValidationError = IError<typeof IS_INT16_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsInt16ArrayValidationSuccess = ISuccess<Int16Array>;

export default function isInt16Array<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsInt16ArrayValidationSuccess | Error;

export default function isInt16Array(
  value: any
): TIsInt16ArrayValidationSuccess | TIsInt16ArrayValidationError;

export default function isInt16Array<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: any,
  error?: Error
): undefined extends Error
  ? (TIsInt16ArrayValidationSuccess | TIsInt16ArrayValidationError)
  : (TIsInt16ArrayValidationSuccess | Error);

export default function isInt16Array(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Int16Array) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_FUNCTION_ERROR_MESSAGE = 'Value should be function' as const;

export type TIsFunctionValidationError = IError<typeof IS_FUNCTION_ERROR_MESSAGE, undefined>;
export type TIsFunctionValidationSuccess = ISuccess<Function>;

export default function isFunction<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsFunctionValidationSuccess | Error;

export default function isFunction(
  value: any
): TIsFunctionValidationSuccess | TIsFunctionValidationError;

export default function isFunction<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: any,
  error?: Error
): undefined extends Error
  ? (TIsFunctionValidationSuccess | TIsFunctionValidationError)
  : (TIsFunctionValidationSuccess | Error);

export default function isFunction(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (typeof value === 'function') {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_FUNCTION_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_FUNCTION_ERROR_MESSAGE, undefined);
  }
} 
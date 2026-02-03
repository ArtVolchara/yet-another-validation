import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_STRING_ERROR_MESSAGE = 'Value should be string' as const;
export type TIsStringValidationSuccess = ISuccess<string>;
export type TIsStringValidationDefaultError = IError<typeof IS_STRING_ERROR_MESSAGE, undefined>;

export default function isString<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsStringValidationSuccess | Error;

export default function isString(value: any): TIsStringValidationSuccess | TIsStringValidationDefaultError;

export default function isString<const Error extends IError<string, undefined>>(
  value: any,
  error?: Error
): TIsStringValidationSuccess | (typeof error extends undefined ? TIsStringValidationDefaultError : Error);

export default function isString(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (typeof value === 'string') {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined);
  }
}

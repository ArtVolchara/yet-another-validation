import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UNDEFINED_ERROR_MESSAGE = 'Value should be undefined' as const;

export type TIsUndefinedValidationError = IError<typeof IS_UNDEFINED_ERROR_MESSAGE, undefined>;
export type TIsUndefinedValidationSuccess = ISuccess<undefined>;

export default function isUndefined<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsUndefinedValidationSuccess | Error;

export default function isUndefined(
  value: any
): TIsUndefinedValidationSuccess | TIsUndefinedValidationError;

export default function isUndefined<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsUndefinedValidationSuccess | TIsUndefinedValidationError)
  : (TIsUndefinedValidationSuccess | Error)
= undefined extends Error
  ? (TIsUndefinedValidationSuccess | TIsUndefinedValidationError)
  : (TIsUndefinedValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isUndefined(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value === undefined) {
      return new SuccessResult(undefined);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined);
  }
}
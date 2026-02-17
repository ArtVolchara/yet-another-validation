import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_BOOLEAN_ERROR_MESSAGE = 'Value should be boolean' as const;

export type TIsBooleanValidationError = IError<typeof IS_BOOLEAN_ERROR_MESSAGE, undefined>;
export type TIsBooleanValidationSuccess = ISuccess<boolean>;

export default function isBoolean<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsBooleanValidationSuccess | Error;

export default function isBoolean(
  value: any
): TIsBooleanValidationSuccess | TIsBooleanValidationError;

export default function isBoolean<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsBooleanValidationSuccess | TIsBooleanValidationError)
  : (TIsBooleanValidationSuccess | Error)
= undefined extends Error
  ? (TIsBooleanValidationSuccess | TIsBooleanValidationError)
  : (TIsBooleanValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isBoolean(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (typeof value === 'boolean') {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined);
  }
}
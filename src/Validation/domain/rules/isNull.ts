import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_NULL_ERROR_MESSAGE = 'Value should be null' as const;

export type TIsNullValidationError = IError<typeof IS_NULL_ERROR_MESSAGE, undefined>;
export type TIsNullValidationSuccess = ISuccess<null>;

export default function isNull<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsNullValidationSuccess | Error;

export default function isNull(
  value: any
): TIsNullValidationSuccess | TIsNullValidationError;

export default function isNull<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsNullValidationSuccess | TIsNullValidationError)
  : (TIsNullValidationSuccess | Error)
= undefined extends Error
  ? (TIsNullValidationSuccess | TIsNullValidationError)
  : (TIsNullValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isNull(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value === null) {
      return new SuccessResult(null);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined);
  }
} 
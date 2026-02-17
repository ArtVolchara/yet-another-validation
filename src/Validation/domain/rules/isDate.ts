import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_DATE_ERROR_MESSAGE = 'Value should be Date' as const;

export type TIsDateValidationError = IError<typeof IS_DATE_ERROR_MESSAGE, undefined>;
export type TIsDateValidationSuccess = ISuccess<Date>;

export default function isDate<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsDateValidationSuccess | Error;

export default function isDate(
  value: any
): TIsDateValidationSuccess | TIsDateValidationError;

export default function isDate<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsDateValidationSuccess | TIsDateValidationError)
  : (TIsDateValidationSuccess | Error)
= undefined extends Error
  ? (TIsDateValidationSuccess | TIsDateValidationError)
  : (TIsDateValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isDate(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value)) {
      return new SuccessResult(value as Date);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined);
  }
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_PROMISE_ERROR_MESSAGE = 'Value should be Promise' as const;

export type TIsPromiseValidationError = IError<typeof IS_PROMISE_ERROR_MESSAGE, undefined>;
export type TIsPromiseValidationSuccess = ISuccess<Promise<any>>;

export default function isPromise<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsPromiseValidationSuccess | Error;

export default function isPromise(
  value: any
): TIsPromiseValidationSuccess | TIsPromiseValidationError;

export default function isPromise<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsPromiseValidationSuccess | TIsPromiseValidationError)
  : (TIsPromiseValidationSuccess | Error)
= undefined extends Error
  ? (TIsPromiseValidationSuccess | TIsPromiseValidationError)
  : (TIsPromiseValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isPromise(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Promise) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined);
  }
} 
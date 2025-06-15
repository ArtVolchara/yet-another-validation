import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_PROMISE_ERROR_MESSAGE = 'Value must be a Promise' as const;

export type TIsPromiseValidationError = IError<typeof IS_PROMISE_ERROR_MESSAGE, undefined>;
export type TIsPromiseValidationSuccess = ISuccess<Promise<unknown>>;

export default function isPromise(value: unknown): TIsPromiseValidationSuccess | TIsPromiseValidationError {
  try {
    if (value instanceof Promise) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined);
  }
} 
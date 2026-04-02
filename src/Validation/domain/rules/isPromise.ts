import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_PROMISE_ERROR_MESSAGE = 'Value should be Promise' as const;

export type TIsPromiseValidationError = IError<typeof IS_PROMISE_ERROR_MESSAGE, undefined>;
export type TIsPromiseValidationSuccess = ISuccess<Promise<any>>;

type TIsPromiseValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsPromiseValidationSuccess | TIsPromiseValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsPromiseValidationError
    : TIsPromiseValidationSuccess | TIsPromiseValidationError;

export default function isPromise<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsPromiseValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined) as TIsPromiseValidationResult<Params>;
  }
  try {
    if (value instanceof Promise) {
      return new SuccessResult(value) as TIsPromiseValidationResult<Params>;
    }
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined) as TIsPromiseValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined) as TIsPromiseValidationResult<Params>;
  }
}

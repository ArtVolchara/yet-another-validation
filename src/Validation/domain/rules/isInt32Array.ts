import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_INT32_ARRAY_ERROR_MESSAGE = 'Value should be Int32Array' as const;

export type TIsInt32ArrayValidationError = IError<typeof IS_INT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsInt32ArrayValidationSuccess = ISuccess<Int32Array>;

type TIsInt32ArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsInt32ArrayValidationSuccess | TIsInt32ArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsInt32ArrayValidationError
    : TIsInt32ArrayValidationSuccess | TIsInt32ArrayValidationError;

export default function isInt32Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsInt32ArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_INT32_ARRAY_ERROR_MESSAGE, undefined) as TIsInt32ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Int32Array) {
      return new SuccessResult(value) as TIsInt32ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_INT32_ARRAY_ERROR_MESSAGE, undefined) as TIsInt32ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_INT32_ARRAY_ERROR_MESSAGE, undefined) as TIsInt32ArrayValidationResult<Params>;
  }
}

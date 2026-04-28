import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_INT8_ARRAY_ERROR_MESSAGE = 'Value should be Int8Array' as const;

export type TIsInt8ArrayValidationError = IError<typeof IS_INT8_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsInt8ArrayValidationSuccess = ISuccess<Int8Array>;

type TIsInt8ArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsInt8ArrayValidationSuccess | TIsInt8ArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsInt8ArrayValidationError
    : TIsInt8ArrayValidationSuccess | TIsInt8ArrayValidationError;

export default function isInt8Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsInt8ArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_INT8_ARRAY_ERROR_MESSAGE, undefined) as TIsInt8ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Int8Array) {
      return new SuccessResult(value) as TIsInt8ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_INT8_ARRAY_ERROR_MESSAGE, undefined) as TIsInt8ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_INT8_ARRAY_ERROR_MESSAGE, undefined) as TIsInt8ArrayValidationResult<Params>;
  }
}

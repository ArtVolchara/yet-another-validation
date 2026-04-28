import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_ARRAY_BUFFER_ERROR_MESSAGE = 'Value should be an ArrayBuffer' as const;

export type TIsArrayBufferValidationError = IError<typeof IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined>;
export type TIsArrayBufferValidationSuccess = ISuccess<ArrayBuffer>;

type TIsArrayBufferValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsArrayBufferValidationSuccess | TIsArrayBufferValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsArrayBufferValidationError
      : TIsArrayBufferValidationSuccess | TIsArrayBufferValidationError;

export default function isArrayBuffer<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsArrayBufferValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined) as TIsArrayBufferValidationResult<Params>;
  }
  try {
    if (value instanceof ArrayBuffer) {
      return new SuccessResult(value) as TIsArrayBufferValidationResult<Params>;
    }
    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined) as TIsArrayBufferValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ARRAY_BUFFER_ERROR_MESSAGE, undefined) as TIsArrayBufferValidationResult<Params>;
  }
}

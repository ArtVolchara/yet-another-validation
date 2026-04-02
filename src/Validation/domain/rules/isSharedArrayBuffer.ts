import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE = 'Value should be a SharedArrayBuffer' as const;

export type TIsSharedArrayBufferValidationError = IError<typeof IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined>;
export type TIsSharedArrayBufferValidationSuccess = ISuccess<SharedArrayBuffer>;

type TIsSharedArrayBufferValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsSharedArrayBufferValidationSuccess | TIsSharedArrayBufferValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsSharedArrayBufferValidationError
    : TIsSharedArrayBufferValidationSuccess | TIsSharedArrayBufferValidationError;

export default function isSharedArrayBuffer<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsSharedArrayBufferValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined) as TIsSharedArrayBufferValidationResult<Params>;
  }
  try {
    if (value instanceof SharedArrayBuffer) {
      return new SuccessResult(value) as TIsSharedArrayBufferValidationResult<Params>;
    }
    return new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined) as TIsSharedArrayBufferValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined) as TIsSharedArrayBufferValidationResult<Params>;
  }
}

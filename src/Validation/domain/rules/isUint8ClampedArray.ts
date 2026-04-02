import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE = 'Value should be Uint8ClampedArray' as const;

export type TIsUint8ClampedArrayValidationError = IError<typeof IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint8ClampedArrayValidationSuccess = ISuccess<Uint8ClampedArray>;

type TIsUint8ClampedArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsUint8ClampedArrayValidationSuccess | TIsUint8ClampedArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsUint8ClampedArrayValidationError
    : TIsUint8ClampedArrayValidationSuccess | TIsUint8ClampedArrayValidationError;

export default function isUint8ClampedArray<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsUint8ClampedArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined) as TIsUint8ClampedArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Uint8ClampedArray) {
      return new SuccessResult(value) as TIsUint8ClampedArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined) as TIsUint8ClampedArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT8_CLAMPED_ARRAY_ERROR_MESSAGE, undefined) as TIsUint8ClampedArrayValidationResult<Params>;
  }
}

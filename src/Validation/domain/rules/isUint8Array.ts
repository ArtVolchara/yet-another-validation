import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_UINT8_ARRAY_ERROR_MESSAGE = 'Value should be Uint8Array' as const;

export type TIsUint8ArrayValidationError = IError<typeof IS_UINT8_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint8ArrayValidationSuccess = ISuccess<Uint8Array>;

type TIsUint8ArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsUint8ArrayValidationSuccess | TIsUint8ArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsUint8ArrayValidationError
    : TIsUint8ArrayValidationSuccess | TIsUint8ArrayValidationError;

export default function isUint8Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsUint8ArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined) as TIsUint8ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Uint8Array) {
      return new SuccessResult(value) as TIsUint8ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined) as TIsUint8ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT8_ARRAY_ERROR_MESSAGE, undefined) as TIsUint8ArrayValidationResult<Params>;
  }
}

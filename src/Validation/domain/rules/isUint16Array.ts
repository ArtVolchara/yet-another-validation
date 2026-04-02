import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_UINT16_ARRAY_ERROR_MESSAGE = 'Value should be Uint16Array' as const;

export type TIsUint16ArrayValidationError = IError<typeof IS_UINT16_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint16ArrayValidationSuccess = ISuccess<Uint16Array>;

type TIsUint16ArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsUint16ArrayValidationSuccess | TIsUint16ArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsUint16ArrayValidationError
    : TIsUint16ArrayValidationSuccess | TIsUint16ArrayValidationError;

export default function isUint16Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsUint16ArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_UINT16_ARRAY_ERROR_MESSAGE, undefined) as TIsUint16ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Uint16Array) {
      return new SuccessResult(value) as TIsUint16ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_UINT16_ARRAY_ERROR_MESSAGE, undefined) as TIsUint16ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT16_ARRAY_ERROR_MESSAGE, undefined) as TIsUint16ArrayValidationResult<Params>;
  }
}

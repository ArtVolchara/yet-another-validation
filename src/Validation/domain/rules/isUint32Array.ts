import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_UINT32_ARRAY_ERROR_MESSAGE = 'Value should be Uint32Array' as const;

export type TIsUint32ArrayValidationError = IError<typeof IS_UINT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint32ArrayValidationSuccess = ISuccess<Uint32Array>;

type TIsUint32ArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsUint32ArrayValidationSuccess | TIsUint32ArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsUint32ArrayValidationError
    : TIsUint32ArrayValidationSuccess | TIsUint32ArrayValidationError;

export default function isUint32Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsUint32ArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined) as TIsUint32ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Uint32Array) {
      return new SuccessResult(value) as TIsUint32ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined) as TIsUint32ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT32_ARRAY_ERROR_MESSAGE, undefined) as TIsUint32ArrayValidationResult<Params>;
  }
}

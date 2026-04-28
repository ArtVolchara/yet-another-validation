import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_FLOAT32_ARRAY_ERROR_MESSAGE = 'Value should be Float32Array' as const;

export type TIsFloat32ArrayValidationError = IError<typeof IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsFloat32ArrayValidationSuccess = ISuccess<Float32Array>;

type TIsFloat32ArrayValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsFloat32ArrayValidationSuccess | TIsFloat32ArrayValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsFloat32ArrayValidationError
      : TIsFloat32ArrayValidationSuccess | TIsFloat32ArrayValidationError;

export default function isFloat32Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsFloat32ArrayValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined) as TIsFloat32ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Float32Array) {
      return new SuccessResult(value) as TIsFloat32ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined) as TIsFloat32ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_FLOAT32_ARRAY_ERROR_MESSAGE, undefined) as TIsFloat32ArrayValidationResult<Params>;
  }
}

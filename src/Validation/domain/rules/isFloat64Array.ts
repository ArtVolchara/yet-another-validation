import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_FLOAT64_ARRAY_ERROR_MESSAGE = 'Value should be Float64Array' as const;

export type TIsFloat64ArrayValidationError = IError<typeof IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsFloat64ArrayValidationSuccess = ISuccess<Float64Array>;

type TIsFloat64ArrayValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsFloat64ArrayValidationSuccess | TIsFloat64ArrayValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsFloat64ArrayValidationError
      : TIsFloat64ArrayValidationSuccess | TIsFloat64ArrayValidationError;

export default function isFloat64Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsFloat64ArrayValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined) as TIsFloat64ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Float64Array) {
      return new SuccessResult(value) as TIsFloat64ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined) as TIsFloat64ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_FLOAT64_ARRAY_ERROR_MESSAGE, undefined) as TIsFloat64ArrayValidationResult<Params>;
  }
}

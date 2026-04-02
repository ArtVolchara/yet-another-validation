import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_NAN_ERROR_MESSAGE = 'Value should be NaN' as const;

declare const nan_brand: unique symbol;
export type TNaNNominal = { readonly [nan_brand]: 'NaN' };
export type TIsNaNValidationError = IError<typeof IS_NAN_ERROR_MESSAGE, undefined>;
export type TIsNaNValidationSuccess = ISuccess<TNaNNominal>;

type TIsNaNValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsNaNValidationSuccess | TIsNaNValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsNaNValidationError
    : TIsNaNValidationSuccess | TIsNaNValidationError;

export default function isNaN<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsNaNValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined) as TIsNaNValidationResult<Params>;
  }
  try {
    if (Number.isNaN(value)) {
      return new SuccessResult(value as unknown as TNaNNominal) as TIsNaNValidationResult<Params>;
    }
    return new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined) as TIsNaNValidationResult<Params>;
  } catch (e) {
    return new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined) as TIsNaNValidationResult<Params>;
  }
}

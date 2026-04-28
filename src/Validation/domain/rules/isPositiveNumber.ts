import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_POSITIVE_NUMBER_ERROR_MESSAGE = 'Value should be positive number' as const;

declare const positive_number_brand: unique symbol;
export type TPositiveNumberNominal = { readonly [positive_number_brand]:'PositiveNumber' };
export type TIsPositiveNumberValidationError = IError<typeof IS_POSITIVE_NUMBER_ERROR_MESSAGE, undefined>;
export type TIsPositiveNumberValidationSuccess = ISuccess<TPositiveNumberNominal>;

type TIsPositiveNumberValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsPositiveNumberValidationSuccess | TIsPositiveNumberValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsPositiveNumberValidationError
      : TIsPositiveNumberValidationSuccess | TIsPositiveNumberValidationError;

export default function isPositiveNumber<const Params extends TValidationParams | undefined = undefined>(
  value: number,
  params?: Params,
): TIsPositiveNumberValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_POSITIVE_NUMBER_ERROR_MESSAGE, undefined) as TIsPositiveNumberValidationResult<Params>;
  }
  try {
    if (value > 0) {
      return new SuccessResult(value as unknown as TPositiveNumberNominal) as TIsPositiveNumberValidationResult<Params>;
    }
    return new ErrorResult(IS_POSITIVE_NUMBER_ERROR_MESSAGE, undefined) as TIsPositiveNumberValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_POSITIVE_NUMBER_ERROR_MESSAGE, undefined) as TIsPositiveNumberValidationResult<Params>;
  }
}

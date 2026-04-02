import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

declare const ArrayExactLengthBrand: unique symbol;
export type TIsArrayExactLengthNominal<Number extends number> = { readonly [ArrayExactLengthBrand]: `isArrayExactLength${Number}`, length: Number };

export type TIsArrayExactLengthValidationError<ExactLength extends number> = IError<`Array should contain exactly ${ExactLength} elements`, undefined>;
export type TIsArrayExactLengthValidationSuccess<ExactLength extends number> = ISuccess<TIsArrayExactLengthNominal<ExactLength>>;

type TIsArrayExactLengthValidationResult<ExactLength extends number, Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsArrayExactLengthValidationSuccess<ExactLength> | TIsArrayExactLengthValidationError<ExactLength>
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsArrayExactLengthValidationError<ExactLength>
      : TIsArrayExactLengthValidationSuccess<ExactLength> | TIsArrayExactLengthValidationError<ExactLength>;

type TIsArrayExactLengthValidationRule<ExactLength extends number> =
  <const Params extends TValidationParams | undefined = undefined>(
    value: Array<any>,
    params?: Params,
  ) => TIsArrayExactLengthValidationResult<ExactLength, Params>;

export default function generateArrayExactLengthValidator<ExactLength extends number>(
  exactLength: ExactLength,
): TIsArrayExactLengthValidationRule<ExactLength> {
  function isArrayExactLength<const Params extends TValidationParams | undefined = undefined>(
    value: Array<any>,
    params?: Params,
  ): TIsArrayExactLengthValidationResult<ExactLength, Params> {
    if (params?.shouldReturnError === true) {
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined) as TIsArrayExactLengthValidationResult<ExactLength, Params>;
    }
    try {
      if (Array.isArray(value) && value.length === exactLength) {
        return new SuccessResult(value as unknown as TIsArrayExactLengthNominal<ExactLength>) as TIsArrayExactLengthValidationResult<ExactLength, Params>;
      }
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined) as TIsArrayExactLengthValidationResult<ExactLength, Params>;
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined) as TIsArrayExactLengthValidationResult<ExactLength, Params>;
    }
  }
  return isArrayExactLength;
}

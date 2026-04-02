import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import type { TValidationParams } from '../types/TValidator';

declare const MinLengthBrand: unique symbol;
export type TIsArrayMinLengthNominal<Number extends number> = { readonly [MinLengthBrand]: `isArrayMinLength${Number}`, };

export type TIsArrayMinLengthValidationError<MinLength extends number> = IError<`Array should contain more than ${MinLength} elements`, undefined>;
export type TIsArrayMinLengthValidationSuccess<MinLength extends number> = ISuccess<TIsArrayMinLengthNominal<MinLength>>;

type TIsArrayMinLengthValidationResult<MinLength extends number, Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsArrayMinLengthValidationSuccess<MinLength> | TIsArrayMinLengthValidationError<MinLength>
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsArrayMinLengthValidationError<MinLength>
      : TIsArrayMinLengthValidationSuccess<MinLength> | TIsArrayMinLengthValidationError<MinLength>;

type TIsArrayMinLengthValidationRule<MinLength extends number> =
  <const Params extends TValidationParams | undefined = undefined>(
    value: Array<any>,
    params?: Params,
  ) => TIsArrayMinLengthValidationResult<MinLength, Params>;

export default function generateArrayMinLengthValidator<MinLength extends number>(
  minLength: MinLength,
): TIsArrayMinLengthValidationRule<MinLength> {
  function isArrayMinLength<const Params extends TValidationParams | undefined = undefined>(
    value: Array<any>,
    params?: Params,
  ): TIsArrayMinLengthValidationResult<MinLength, Params> {
    if (params?.shouldReturnError === true) {
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined) as TIsArrayMinLengthValidationResult<MinLength, Params>;
    }
    try {
      if (Array.isArray(value) && value.length >= minLength) {
        return new SuccessResult(value as unknown as TIsArrayMinLengthNominal<MinLength>) as TIsArrayMinLengthValidationResult<MinLength, Params>;
      }
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined) as TIsArrayMinLengthValidationResult<MinLength, Params>;
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined) as TIsArrayMinLengthValidationResult<MinLength, Params>;
    }
  }
  return isArrayMinLength;
}

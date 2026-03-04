import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const ArrayExactLengthBrand: unique symbol;
export type TIsArrayExactLengthNominal<Number extends number> = { readonly [ArrayExactLengthBrand]: `isArrayExactLength${Number}`, length: Number };

export type TIsArrayExactLengthValidationError<ExactLength extends number> = IError<`Array should contain exactly ${ExactLength} elements`, undefined>;
export type TIsArrayExactLengthValidationSuccess<ExactLength extends number> = ISuccess<TIsArrayExactLengthNominal<ExactLength>>;

type TIsArrayExactLengthValidationRule<ExactLength extends number> = (
  value: Array<any>,
) => TIsArrayExactLengthValidationSuccess<ExactLength> | TIsArrayExactLengthValidationError<ExactLength>;

export default function generateArrayExactLengthValidator<ExactLength extends number>(
  exactLength: ExactLength,
): TIsArrayExactLengthValidationRule<ExactLength> {
  return function isArrayExactLength(
    value: Array<any>,
  ) {
    try {
      if (Array.isArray(value) && value.length === exactLength) {
        return new SuccessResult(value as unknown as TIsArrayExactLengthNominal<ExactLength>);
      }
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined);
    }
  };
}

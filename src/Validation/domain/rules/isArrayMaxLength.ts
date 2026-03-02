import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const MaxLengthBrand: unique symbol;
export type TIsArrayMaxLengthNominal<Number extends number> = { readonly [MaxLengthBrand]: `isArrayMaxLength${Number}`, };

export type TIsArrayMaxLengthValidationError<MaxLength extends number> = IError<`Array should contain less than ${MaxLength} elements`, undefined>;
export type TIsArrayMaxLengthValidationSuccess<MaxLength extends number> = ISuccess<TIsArrayMaxLengthNominal<MaxLength>>;

type TIsArrayMaxLengthValidationRule<MaxLength extends number> = (
  value: Array<any>,
) => TIsArrayMaxLengthValidationSuccess<MaxLength> | TIsArrayMaxLengthValidationError<MaxLength>;

export default function generateArrayMaxLengthValidationRule<MaxLength extends number>(
  maxLength: MaxLength,
): TIsArrayMaxLengthValidationRule<MaxLength> {
  return function isArrayMaxLength(
    value: Array<any>,
  ) {
    try {
      if (Array.isArray(value) && value.length <= maxLength) {
        return new SuccessResult(value as unknown as TIsArrayMaxLengthNominal<MaxLength>);
      }
      return new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);
    }
  };
}

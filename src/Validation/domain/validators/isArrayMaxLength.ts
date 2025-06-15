import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const MaxLengthBrand: unique symbol;
export type TIsArrayMaxLengthNominal<Number extends number> = { readonly [MaxLengthBrand]: `isArrayMaxLength${Number}`, };

export type TIsArrayMaxLengthValidationError<MaxLength extends number> = IError<`Array should contain less than ${MaxLength} elements`, undefined>;
export type TIsArrayMaxLengthValidationSuccess<Value extends Array<unknown> = Array<unknown>> = ISuccess<Value & TIsArrayMaxLengthNominal<number>>;

export default function generateArrayMaxLengthValidator<MaxLength extends number>(maxLength: MaxLength) {
  return function isArrayMaxLength<Value extends Array<unknown>>(value: Value): TIsArrayMaxLengthValidationSuccess<Value> | TIsArrayMaxLengthValidationError<MaxLength> {
    try {
      if (value.length <= maxLength) {
        return new SuccessResult(value as Value & TIsArrayMaxLengthNominal<number>);
      }
      return new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);
    }
  };
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';

declare const MinLengthBrand: unique symbol;
export type TIsArrayMinLengthNominal<Number extends number> = { readonly [MinLengthBrand]: `isArrayMinLength${Number}`, };

export type TIsArrayMinLengthValidationError<MinLength extends number> = IError<`Array should contain more than ${MinLength} elements`, undefined>;
export type TIsArrayMinLengthValidationSuccess<MinLength extends number> = ISuccess<TIsArrayMinLengthNominal<MinLength>>;

export default function generateArrayMinLengthValidator<MinLength extends number>(minLength: MinLength) {
  return function isArrayMinLength<Value extends Array<unknown>>(value: Value): TIsArrayMinLengthValidationSuccess<MinLength> | TIsArrayMinLengthValidationError<MinLength> {
    try {
      if (value.length >= minLength) {
        return new SuccessResult(value as unknown as TIsArrayMinLengthNominal<MinLength>);
      }
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined);
    }
  };
}
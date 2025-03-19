import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

declare const MaxLengthBrand: unique symbol;
export type TIsArrayMaxLengthNominal<Number extends number> = { readonly [MaxLengthBrand]: `isArrayMaxLength${Number}`, };

export default function generateArrayMaxLengthValidator<Number extends number>(number: Number) {
  return function isArrayMaxLength(value: Array<any>) {
    try {
      if (value.length <= number) {
        return new SuccessResult(value as unknown as TIsArrayMaxLengthNominal<Number>);
      }
      return new ErrorResult(`Array should contain less than ${number} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain less than ${number} elements`, undefined);
    }
  };
}

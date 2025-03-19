import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

declare const MinLengthBrand: unique symbol;
export type TIsArrayMinLengthNominal<Number extends number> = { readonly [MinLengthBrand]: `isArrayMinLength${Number}`, };

export default function generateArrayMinLengthValidator<Number extends number>(number: Number) {
  return function isArrayMinLength(value: Array<any>) {
    try {
      if (value.length >= number) {
        return new SuccessResult(value as unknown as TIsArrayMinLengthNominal<Number>);
      }
      return new ErrorResult(`Array should contain more than ${number} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain more than ${number} elements`, undefined);
    }
  };
}

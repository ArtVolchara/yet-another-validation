import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

declare const ArrayExactLengthBrand: unique symbol;
export type TIsArrayExactLengthNominal<Number extends number> = { readonly [ArrayExactLengthBrand]: `isArrayExactLength${Number}`, length: Number };

export default function generateArrayExactLengthValidator<Number extends number>(number: Number) {
  return function isArrayExactLength(value: Array<any>) {
    try {
      if (value.length === number) {
        return new SuccessResult(value as unknown as TIsArrayExactLengthNominal<Number>);
      }
      return new ErrorResult(`Array should contain exactly ${number} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain exactly ${number} elements`, undefined);
    }
  };
}

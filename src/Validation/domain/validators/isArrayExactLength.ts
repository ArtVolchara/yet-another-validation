import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const ArrayExactLengthBrand: unique symbol;
export type TIsArrayExactLengthNominal<Number extends number> = { readonly [ArrayExactLengthBrand]: `isArrayExactLength${Number}`, length: Number };

export type TIsArrayExactLengthValidationError<ExactLength extends number> = IError<`Array should contain exactly ${ExactLength} elements`, undefined>;
export type TIsArrayExactLengthValidationSuccess<Value extends Array<unknown> = Array<unknown>> = ISuccess<Value & TIsArrayExactLengthNominal<number>>;

export default function generateArrayExactLengthValidator<ExactLength extends number>(exactLength: ExactLength) {
  return function isArrayExactLength<Value extends Array<unknown>>(value: Value): TIsArrayExactLengthValidationSuccess<Value> | TIsArrayExactLengthValidationError<ExactLength> {
    try {
      if (value.length === exactLength) {
        return new SuccessResult(value as Value & TIsArrayExactLengthNominal<number>);
      }
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined);
    }
  };
}

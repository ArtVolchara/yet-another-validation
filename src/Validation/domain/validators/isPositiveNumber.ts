import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

declare const positive_number_brand: unique symbol;
export type TPositiveNumberNominal = { readonly [positive_number_brand]:'PositiveNumber' };
export default function isPositiveNumber(value: number) {
  try {
    if (typeof value === 'number' && value > 0) {
      return new SuccessResult(value as unknown as TPositiveNumberNominal);
    }
    return new ErrorResult('Value should be a positive number', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('Value should be a positive number', undefined);
  }
}

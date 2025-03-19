import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

declare const only_digits_brand: unique symbol;
export type TOnlyDigitsNominal = { readonly [only_digits_brand]: 'OnlyDigits' };

export default function isOnlyDigitsString(value: string) {
  try {
    if (/^[0-9][0-9]*$/.test(value)) {
      return new SuccessResult(value as unknown as TOnlyDigitsNominal);
    }
    return new ErrorResult('String should contain only digits', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('String should contain only digits', undefined);
  }
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

declare const only_english_letters_brand: unique symbol;
export type TOnlyEnglishLettersNominal = { readonly [only_english_letters_brand]: 'OnlyEnglishLetters' };

export default function isOnlyEnglishLettersString(value: string) {
  try {
    if (/^[a-zA-Z]+$/.test(value)) {
      return new SuccessResult(value as unknown as TOnlyEnglishLettersNominal);
    }
    return new ErrorResult('Value should contain only english letters', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('Value should contain only english letters', undefined);
  }
}

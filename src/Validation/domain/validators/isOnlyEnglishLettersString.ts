import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const only_english_letters_brand: unique symbol;
export type TOnlyEnglishLettersNominal = { readonly [only_english_letters_brand]: 'OnlyEnglishLetters' };

export const IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE = 'Value should contain only English letters' as const;

export type TIsOnlyEnglishLettersStringValidationError = IError<typeof IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined>;
export type TIsOnlyEnglishLettersStringValidationSuccess = ISuccess<TOnlyEnglishLettersNominal>;

export default function isOnlyEnglishLettersString(value: string): TIsOnlyEnglishLettersStringValidationSuccess | TIsOnlyEnglishLettersStringValidationError {
  try {
    if (typeof value === 'string') {
      if (/^[a-zA-Z]+$/.test(value)) {
        return new SuccessResult(value as unknown as TOnlyEnglishLettersNominal);
      }
    }
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined);
  }
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const only_english_letters_brand: unique symbol;
export type TOnlyEnglishLettersNominal = { readonly [only_english_letters_brand]: 'OnlyEnglishLetters' };

export const IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE = 'Value should contain only English letters' as const;

export type TIsOnlyEnglishLettersStringValidationDefaultError = IError<typeof IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined>;
export type TIsOnlyEnglishLettersStringValidationSuccess = ISuccess<TOnlyEnglishLettersNominal>;

export default function isOnlyEnglishLettersString<const Error extends IError<string, undefined>>(
  value: string,
  error: Error
): TIsOnlyEnglishLettersStringValidationSuccess | Error;

export default function isOnlyEnglishLettersString(
  value: string
): TIsOnlyEnglishLettersStringValidationSuccess | TIsOnlyEnglishLettersStringValidationDefaultError;

export default function isOnlyEnglishLettersString<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsOnlyEnglishLettersStringValidationSuccess | TIsOnlyEnglishLettersStringValidationDefaultError)
  : (TIsOnlyEnglishLettersStringValidationSuccess | Error)
= undefined extends Error
  ? (TIsOnlyEnglishLettersStringValidationSuccess | TIsOnlyEnglishLettersStringValidationDefaultError)
  : (TIsOnlyEnglishLettersStringValidationSuccess | Error),
>(
  value: string,
  error?: Error
): Result;

export default function isOnlyEnglishLettersString<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: string,
  error?: Error,
) {
  try {
    if (typeof value === 'string') {
      if (/^[a-zA-Z]+$/.test(value)) {
        return new SuccessResult(value as unknown as TOnlyEnglishLettersNominal);
      }
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined);
  }
}

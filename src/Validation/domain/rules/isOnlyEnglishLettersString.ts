import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

declare const only_english_letters_brand: unique symbol;
export type TOnlyEnglishLettersNominal = { readonly [only_english_letters_brand]: 'OnlyEnglishLetters' };

export const IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE = 'Value should contain only English letters' as const;

export type TIsOnlyEnglishLettersStringValidationDefaultError = IError<typeof IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined>;
export type TIsOnlyEnglishLettersStringValidationSuccess = ISuccess<TOnlyEnglishLettersNominal>;

type TIsOnlyEnglishLettersStringValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsOnlyEnglishLettersStringValidationSuccess | TIsOnlyEnglishLettersStringValidationDefaultError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsOnlyEnglishLettersStringValidationDefaultError
      : TIsOnlyEnglishLettersStringValidationSuccess | TIsOnlyEnglishLettersStringValidationDefaultError;

export default function isOnlyEnglishLettersString<const Params extends TValidationParams | undefined = undefined>(
  value: string,
  params?: Params,
): TIsOnlyEnglishLettersStringValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined) as TIsOnlyEnglishLettersStringValidationResult<Params>;
  }
  try {
    if (typeof value === 'string') {
      if (/^[a-zA-Z]+$/.test(value)) {
        return new SuccessResult(value as unknown as TOnlyEnglishLettersNominal) as TIsOnlyEnglishLettersStringValidationResult<Params>;
      }
    }
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined) as TIsOnlyEnglishLettersStringValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined) as TIsOnlyEnglishLettersStringValidationResult<Params>;
  }
}

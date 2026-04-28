import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

declare const only_latin_letters_brand: unique symbol;
export type TOnlyLatinLettersNominal = { readonly [only_latin_letters_brand]: 'OnlyLatinLetters' };

export const IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE = 'Value should contain only Latin letters' as const;

export type TIsOnlyLatinLettersStringValidationDefaultError = IError<typeof IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE, undefined>;
export type TIsOnlyLatinLettersStringValidationSuccess = ISuccess<TOnlyLatinLettersNominal>;

type TIsOnlyLatinLettersStringValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsOnlyLatinLettersStringValidationSuccess | TIsOnlyLatinLettersStringValidationDefaultError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsOnlyLatinLettersStringValidationDefaultError
      : TIsOnlyLatinLettersStringValidationSuccess | TIsOnlyLatinLettersStringValidationDefaultError;

export default function isOnlyLatinLettersString<const Params extends TValidationParams | undefined = undefined>(
  value: string,
  params?: Params,
): TIsOnlyLatinLettersStringValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE, undefined) as TIsOnlyLatinLettersStringValidationResult<Params>;
  }
  try {
    if (typeof value === 'string') {
      if (/^[a-zA-Z]+$/.test(value)) {
        return new SuccessResult(value as unknown as TOnlyLatinLettersNominal) as TIsOnlyLatinLettersStringValidationResult<Params>;
      }
    }
    return new ErrorResult(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE, undefined) as TIsOnlyLatinLettersStringValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE, undefined) as TIsOnlyLatinLettersStringValidationResult<Params>;
  }
}

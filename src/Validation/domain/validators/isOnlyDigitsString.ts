import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const only_digits_brand: unique symbol;
export type TOnlyDigitsNominal = { readonly [only_digits_brand]: 'OnlyDigits' };

export const IS_ONLY_DIGITS_STRING_ERROR_MESSAGE = 'Value should contain only digits' as const;

export type TIsOnlyDigitsStringValidationError = IError<typeof IS_ONLY_DIGITS_STRING_ERROR_MESSAGE, undefined>;
export type TIsOnlyDigitsStringValidationSuccess = ISuccess<TOnlyDigitsNominal>;

export default function isOnlyDigitsString(value: string): TIsOnlyDigitsStringValidationSuccess | TIsOnlyDigitsStringValidationError {
  try {
    if (typeof value === 'string') {
      if (/^[0-9][0-9]*$/.test(value)) {
        return new SuccessResult(value as unknown as TOnlyDigitsNominal);
      }
    }
    return new ErrorResult(IS_ONLY_DIGITS_STRING_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ONLY_DIGITS_STRING_ERROR_MESSAGE, undefined);
  }
}

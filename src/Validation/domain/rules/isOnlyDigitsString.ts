import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

declare const only_digits_brand: unique symbol;
export type TOnlyDigitsNominal = { readonly [only_digits_brand]: 'OnlyDigits' };

export const IS_ONLY_DIGITS_STRING_DEFAULT_ERROR_MESSAGE = 'Value should contain only digits' as const;

export type TIsOnlyDigitsStringValidationDefaultError = IError<typeof IS_ONLY_DIGITS_STRING_DEFAULT_ERROR_MESSAGE, undefined>;
export type TIsOnlyDigitsStringValidationSuccess = ISuccess<TOnlyDigitsNominal>;

type TIsOnlyDigitsStringValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsOnlyDigitsStringValidationSuccess | TIsOnlyDigitsStringValidationDefaultError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsOnlyDigitsStringValidationDefaultError
      : TIsOnlyDigitsStringValidationSuccess | TIsOnlyDigitsStringValidationDefaultError;

export default function isOnlyDigitsString<const Params extends TValidationParams | undefined = undefined>(
  value: string,
  params?: Params,
): TIsOnlyDigitsStringValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_ONLY_DIGITS_STRING_DEFAULT_ERROR_MESSAGE, undefined) as TIsOnlyDigitsStringValidationResult<Params>;
  }
  try {
    if (typeof value === 'string') {
      if (/^[0-9][0-9]*$/.test(value)) {
        return new SuccessResult(value as unknown as TOnlyDigitsNominal) as TIsOnlyDigitsStringValidationResult<Params>;
      }
    }
    return new ErrorResult(IS_ONLY_DIGITS_STRING_DEFAULT_ERROR_MESSAGE, undefined) as TIsOnlyDigitsStringValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ONLY_DIGITS_STRING_DEFAULT_ERROR_MESSAGE, undefined) as TIsOnlyDigitsStringValidationResult<Params>;
  }
}

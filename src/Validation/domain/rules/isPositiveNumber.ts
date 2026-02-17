import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE = 'Value should be positive number' as const;

declare const positive_number_brand: unique symbol;
export type TPositiveNumberNominal = { readonly [positive_number_brand]:'PositiveNumber' };
export type TIsPositiveNumberValidationError = IError<typeof IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE, undefined>;
export type TIsPositiveNumberValidationSuccess = ISuccess<TPositiveNumberNominal>;

export default function isPositiveNumber<const Error extends IError<string, undefined>>(
  value: number,
  error: Error
): TIsPositiveNumberValidationSuccess | Error;

export default function isPositiveNumber(
  value: number
): TIsPositiveNumberValidationSuccess | TIsPositiveNumberValidationError;

export default function isPositiveNumber<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsPositiveNumberValidationSuccess | TIsPositiveNumberValidationError)
  : (TIsPositiveNumberValidationSuccess | Error)
= undefined extends Error
  ? (TIsPositiveNumberValidationSuccess | TIsPositiveNumberValidationError)
  : (TIsPositiveNumberValidationSuccess | Error),
>(
  value: number,
  error?: Error
): Result;

export default function isPositiveNumber(
  value: number,
  error?: IError<string, undefined>,
) {
  try {
    if (value > 0) {
      return new SuccessResult(value as unknown as TPositiveNumberNominal);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE, undefined);
  }
}

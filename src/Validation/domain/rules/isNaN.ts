import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_NAN_ERROR_MESSAGE = 'Value should be NaN' as const;

declare const nan_brand: unique symbol;
export type TNaNNominal = { readonly [nan_brand]: 'NaN' };
export type TIsNaNValidationError = IError<typeof IS_NAN_ERROR_MESSAGE, undefined>;
export type TIsNaNValidationSuccess = ISuccess<TNaNNominal>;

export default function isNaN<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsNaNValidationSuccess | Error;

export default function isNaN(
  value: any
): TIsNaNValidationSuccess | TIsNaNValidationError;

export default function isNaN<
const Error extends IError<string, undefined> | undefined = undefined,
>(
  value: any,
  error?: Error
): undefined extends Error
  ? (TIsNaNValidationSuccess | TIsNaNValidationError)
  : (TIsNaNValidationSuccess | Error);

export default function isNaN(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (Number.isNaN(value)) {
      return new SuccessResult(value as unknown as TNaNNominal);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined);
  } catch (e) {
    if (error) {
      return error;
    }
    return new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined);
  }
} 
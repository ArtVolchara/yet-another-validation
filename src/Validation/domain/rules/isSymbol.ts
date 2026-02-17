import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_SYMBOL_ERROR_MESSAGE = 'Value should be symbol' as const;

export type TIsSymbolValidationError = IError<typeof IS_SYMBOL_ERROR_MESSAGE, undefined>;
export type TIsSymbolValidationSuccess = ISuccess<symbol>;

export default function isSymbol<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsSymbolValidationSuccess | Error;

export default function isSymbol(
  value: any
): TIsSymbolValidationSuccess | TIsSymbolValidationError;

export default function isSymbol<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsSymbolValidationSuccess | TIsSymbolValidationError)
  : (TIsSymbolValidationSuccess | Error)
= undefined extends Error
  ? (TIsSymbolValidationSuccess | TIsSymbolValidationError)
  : (TIsSymbolValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isSymbol(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (typeof value === 'symbol') {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);
  }
} 
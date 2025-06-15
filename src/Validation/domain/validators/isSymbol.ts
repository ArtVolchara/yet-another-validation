import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_SYMBOL_ERROR_MESSAGE = 'Value should be Symbol' as const;

export type TIsSymbolValidationError = IError<typeof IS_SYMBOL_ERROR_MESSAGE, undefined>;
export type TIsSymbolValidationSuccess = ISuccess<symbol>;

export default function isSymbol(value: unknown): TIsSymbolValidationSuccess | TIsSymbolValidationError {
  try {
    if (typeof value === 'symbol') {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);
  }
} 
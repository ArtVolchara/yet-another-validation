import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_SYMBOL_ERROR_MESSAGE = 'Value should be symbol' as const;

export type TIsSymbolValidationError = IError<typeof IS_SYMBOL_ERROR_MESSAGE, undefined>;
export type TIsSymbolValidationSuccess = ISuccess<symbol>;

export default function isSymbol(value: any): TIsSymbolValidationSuccess | TIsSymbolValidationError {
  try {
    if (typeof value === 'symbol') {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);
  }
} 
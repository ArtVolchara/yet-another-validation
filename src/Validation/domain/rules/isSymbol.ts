import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_SYMBOL_ERROR_MESSAGE = 'Value should be symbol' as const;

export type TIsSymbolValidationError = IError<typeof IS_SYMBOL_ERROR_MESSAGE, undefined>;
export type TIsSymbolValidationSuccess = ISuccess<symbol>;

type TIsSymbolValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsSymbolValidationSuccess | TIsSymbolValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsSymbolValidationError
    : TIsSymbolValidationSuccess | TIsSymbolValidationError;

export default function isSymbol<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsSymbolValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined) as TIsSymbolValidationResult<Params>;
  }
  try {
    if (typeof value === 'symbol') {
      return new SuccessResult(value) as TIsSymbolValidationResult<Params>;
    }
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined) as TIsSymbolValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined) as TIsSymbolValidationResult<Params>;
  }
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UINT16_ARRAY_ERROR_MESSAGE = 'Value should be Uint16Array' as const;

export type TIsUint16ArrayValidationError = IError<typeof IS_UINT16_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsUint16ArrayValidationSuccess = ISuccess<Uint16Array>;

export default function isUint16Array(value: any): TIsUint16ArrayValidationSuccess | TIsUint16ArrayValidationError {
  try {
    if (value instanceof Uint16Array) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_UINT16_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UINT16_ARRAY_ERROR_MESSAGE, undefined);
  }
} 
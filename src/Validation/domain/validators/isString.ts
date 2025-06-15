import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_STRING_ERROR_MESSAGE = 'Value should be string' as const;

export type TIsStringValidationError = IError<typeof IS_STRING_ERROR_MESSAGE, undefined>;
export type TIsStringValidationSuccess = ISuccess<string>;

export default function isString(value: unknown): TIsStringValidationSuccess | TIsStringValidationError {
  try {
    if (typeof value === 'string') {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined);
  }
}
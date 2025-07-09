import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_BOOLEAN_ERROR_MESSAGE = 'Value should be boolean' as const;

export type TIsBooleanValidationError = IError<typeof IS_BOOLEAN_ERROR_MESSAGE, undefined>;
export type TIsBooleanValidationSuccess = ISuccess<boolean>;

export default function isBoolean(value: any): TIsBooleanValidationSuccess | TIsBooleanValidationError {
  try {
    if (typeof value === 'boolean') {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined);
  }
}
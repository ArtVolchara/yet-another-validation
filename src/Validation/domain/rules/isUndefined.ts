import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_UNDEFINED_ERROR_MESSAGE = 'Value should be undefined' as const;

export type TIsUndefinedValidationError = IError<typeof IS_UNDEFINED_ERROR_MESSAGE, undefined>;
export type TIsUndefinedValidationSuccess = ISuccess<undefined>;

export default function isUndefined(value: any): TIsUndefinedValidationSuccess | TIsUndefinedValidationError {
  try {
    if (value === undefined) {
      return new SuccessResult(undefined);
    }
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_UNDEFINED_ERROR_MESSAGE, undefined);
  }
}
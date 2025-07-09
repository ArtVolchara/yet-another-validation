import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_SET_ERROR_MESSAGE = 'Value should be Set' as const;

export type TIsSetValidationError = IError<typeof IS_SET_ERROR_MESSAGE, undefined>;
export type TIsSetValidationSuccess = ISuccess<Set<any>>;

export default function isSet(value: any): TIsSetValidationSuccess | TIsSetValidationError {
  try {
    if (value instanceof Set) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined);
  }
} 
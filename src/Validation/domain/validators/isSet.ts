import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_SET_ERROR_MESSAGE = 'Value should be a Set' as const;

export type TIsSetValidationError = IError<typeof IS_SET_ERROR_MESSAGE, undefined>;
export type TIsSetValidationSuccess = ISuccess<Set<unknown>>;

export default function isSet(value: unknown): TIsSetValidationSuccess | TIsSetValidationError {
  try {
    if (value instanceof Set) {
      return new SuccessResult(value as Set<unknown>);
    }

    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined);
  }
} 
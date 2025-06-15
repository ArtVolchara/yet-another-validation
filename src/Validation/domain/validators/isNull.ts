import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_NULL_ERROR_MESSAGE = 'Value should be null' as const;

export type TIsNullValidationError = IError<typeof IS_NULL_ERROR_MESSAGE, undefined>;
export type TIsNullValidationSuccess = ISuccess<null>;

export default function isNull(value: unknown): TIsNullValidationSuccess | TIsNullValidationError {
  try {
    if (value === null) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined);
  }
} 
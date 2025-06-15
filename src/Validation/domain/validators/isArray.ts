import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_ARRAY_ERROR_MESSAGE = 'Value should be array' as const;

export type TIsArrayValidationError = IError<typeof IS_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsArrayValidationSuccess = ISuccess<unknown[]>;

export default function isArray(value: unknown): TIsArrayValidationSuccess | TIsArrayValidationError {
  try {
    if (Array.isArray(value)) {
      // для теста на возвращаемое значение при throw error
      value.length
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined);
  }
}

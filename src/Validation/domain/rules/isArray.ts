import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_ARRAY_ERROR_MESSAGE = 'Value should be array' as const;

export type TIsArrayValidationError = IError<typeof IS_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsArrayValidationSuccess = ISuccess<any[]>;

export default function isArray(value: any): TIsArrayValidationSuccess | TIsArrayValidationError {
  try {
    if (Array.isArray(value)) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined);
  }
}

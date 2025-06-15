import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_DATE_ERROR_MESSAGE = 'Value should be Date' as const;

export type TIsDateValidationError = IError<typeof IS_DATE_ERROR_MESSAGE, undefined>;
export type TIsDateValidationSuccess = ISuccess<Date>;

export default function isDate(value: unknown): TIsDateValidationSuccess | TIsDateValidationError {
  try {
    if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value)) {
      return new SuccessResult(value as Date);
    }
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined);
  }
}

import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_OBJECT_ERROR_MESSAGE = 'Value should be object' as const;

export type TIsObjectValidationError = IError<typeof IS_OBJECT_ERROR_MESSAGE, undefined>;
export type TIsObjectValidationSuccess = ISuccess<Record<string | symbol, any>>;

export default function isObject(value: any): TIsObjectValidationSuccess | TIsObjectValidationError {
  try {
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Object]' &&
      !Array.isArray(value)
    ) {
      return new SuccessResult(value as Record<string, any>);
    }
    return new ErrorResult(IS_OBJECT_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_OBJECT_ERROR_MESSAGE, undefined);
  }
}

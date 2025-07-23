import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_MAP_ERROR_MESSAGE = 'Value should be a Map' as const;

export type TIsMapValidationError = IError<typeof IS_MAP_ERROR_MESSAGE, undefined>;
export type TIsMapValidationSuccess = ISuccess<Map<unknown, unknown>>;

export default function isMap(value: any): TIsMapValidationSuccess | TIsMapValidationError {
  try {
    if (value instanceof Map) {
      return new SuccessResult(value as Map<unknown, unknown>);
    }

    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined);
  }
} 
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_MAP_ERROR_MESSAGE = 'Value should be a Map' as const;

export type TIsMapValidationError = IError<typeof IS_MAP_ERROR_MESSAGE, undefined>;
export type TIsMapValidationSuccess = ISuccess<Map<unknown, unknown>>;

export default function isMap<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsMapValidationSuccess | Error;

export default function isMap(
  value: any
): TIsMapValidationSuccess | TIsMapValidationError;

export default function isMap<
const Error extends IError<string, undefined> | undefined = undefined,
const Result extends undefined extends Error
  ? (TIsMapValidationSuccess | TIsMapValidationError)
  : (TIsMapValidationSuccess | Error)
= undefined extends Error
  ? (TIsMapValidationSuccess | TIsMapValidationError)
  : (TIsMapValidationSuccess | Error),
>(
  value: any,
  error?: Error
): Result;

export default function isMap(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (value instanceof Map) {
      return new SuccessResult(value as Map<unknown, unknown>);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined);
  }
} 
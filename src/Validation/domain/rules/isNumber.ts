import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

export const IS_NUMBER_ERROR_MESSAGE = 'Value should be number' as const;

export type TIsNumberValidationError = IError<typeof IS_NUMBER_ERROR_MESSAGE, undefined>;
export type TIsNumberValidationSuccess = ISuccess<number>;

export default function isNumber<const Error extends IError<string, undefined>>(
  value: any,
  error: Error
): TIsNumberValidationSuccess | Error;

export default function isNumber(
  value: any
): TIsNumberValidationSuccess | TIsNumberValidationError;

export default function isNumber(
  value: any,
  error?: IError<string, undefined>,
) {
  try {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return new SuccessResult(value);
    }
    if (error) {
      return error;
    }
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined);
  } catch (e) {
    console.error(e);
    if (error) {
      return error;
    }
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined);
  }
}

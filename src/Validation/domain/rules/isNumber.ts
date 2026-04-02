import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import type { TValidationParams } from '../types/TValidator';

export const IS_NUMBER_ERROR_MESSAGE = 'Value should be number' as const;

export type TIsNumberValidationError = IError<typeof IS_NUMBER_ERROR_MESSAGE, undefined>;
export type TIsNumberValidationSuccess = ISuccess<number>;

type TIsNumberValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsNumberValidationSuccess | TIsNumberValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsNumberValidationError
    : TIsNumberValidationSuccess | TIsNumberValidationError;

export default function isNumber<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsNumberValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined) as TIsNumberValidationResult<Params>;
  }
  try {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return new SuccessResult(value) as TIsNumberValidationResult<Params>;
    }
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined) as TIsNumberValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined) as TIsNumberValidationResult<Params>;
  }
}

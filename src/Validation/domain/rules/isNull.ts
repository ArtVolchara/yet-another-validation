import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import type { TValidationParams } from '../types/TValidator';

export const IS_NULL_ERROR_MESSAGE = 'Value should be null' as const;

export type TIsNullValidationError = IError<typeof IS_NULL_ERROR_MESSAGE, undefined>;
export type TIsNullValidationSuccess = ISuccess<null>;

type TIsNullValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsNullValidationSuccess | TIsNullValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsNullValidationError
    : TIsNullValidationSuccess | TIsNullValidationError;

export default function isNull<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsNullValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined) as TIsNullValidationResult<Params>;
  }
  try {
    if (value === null) {
      return new SuccessResult(null) as TIsNullValidationResult<Params>;
    }
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined) as TIsNullValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined) as TIsNullValidationResult<Params>;
  }
}
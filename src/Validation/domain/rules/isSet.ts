import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import type { TValidationParams } from '../types/TValidator';

export const IS_SET_ERROR_MESSAGE = 'Value should be Set' as const;

export type TIsSetValidationError = IError<typeof IS_SET_ERROR_MESSAGE, undefined>;
export type TIsSetValidationSuccess = ISuccess<Set<any>>;

type TIsSetValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsSetValidationSuccess | TIsSetValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsSetValidationError
    : TIsSetValidationSuccess | TIsSetValidationError;

export default function isSet<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsSetValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined) as TIsSetValidationResult<Params>;
  }
  try {
    if (value instanceof Set) {
      return new SuccessResult(value) as TIsSetValidationResult<Params>;
    }
    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined) as TIsSetValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_SET_ERROR_MESSAGE, undefined) as TIsSetValidationResult<Params>;
  }
}

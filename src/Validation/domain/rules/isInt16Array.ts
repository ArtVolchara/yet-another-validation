import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_INT16_ARRAY_ERROR_MESSAGE = 'Value should be Int16Array' as const;

export type TIsInt16ArrayValidationError = IError<typeof IS_INT16_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsInt16ArrayValidationSuccess = ISuccess<Int16Array>;

type TIsInt16ArrayValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsInt16ArrayValidationSuccess | TIsInt16ArrayValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsInt16ArrayValidationError
    : TIsInt16ArrayValidationSuccess | TIsInt16ArrayValidationError;

export default function isInt16Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsInt16ArrayValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined) as TIsInt16ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof Int16Array) {
      return new SuccessResult(value) as TIsInt16ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined) as TIsInt16ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined) as TIsInt16ArrayValidationResult<Params>;
  }
}

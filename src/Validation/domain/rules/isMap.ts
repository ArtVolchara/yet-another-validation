import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_MAP_ERROR_MESSAGE = 'Value should be a Map' as const;

export type TIsMapValidationError = IError<typeof IS_MAP_ERROR_MESSAGE, undefined>;
export type TIsMapValidationSuccess = ISuccess<Map<unknown, unknown>>;

type TIsMapValidationResult<Params extends TValidationParams | undefined = undefined> = 
[NonNullable<Params>['shouldReturnError']] extends [never]
  ? TIsMapValidationSuccess | TIsMapValidationError
  : [NonNullable<Params>['shouldReturnError']] extends [true]
    ? TIsMapValidationError
    : TIsMapValidationSuccess | TIsMapValidationError;

export default function isMap<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsMapValidationResult<Params> {

  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined) as TIsMapValidationResult<Params>;
  }
  try {
    if (value instanceof Map) {
      return new SuccessResult(value as Map<unknown, unknown>) as TIsMapValidationResult<Params>;
    }
    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined) as TIsMapValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_MAP_ERROR_MESSAGE, undefined) as TIsMapValidationResult<Params>;
  }
}

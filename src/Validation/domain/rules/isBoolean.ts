import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult, SuccessResult } from '../../../_Root/domain/factories';
import type { TValidationParams } from '../types/TValidator';

export const IS_BOOLEAN_ERROR_MESSAGE = 'Value should be boolean' as const;

export type TIsBooleanValidationError = IError<typeof IS_BOOLEAN_ERROR_MESSAGE, undefined>;
export type TIsBooleanValidationSuccess = ISuccess<boolean>;

type TIsBooleanValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsBooleanValidationSuccess | TIsBooleanValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsBooleanValidationError
      : TIsBooleanValidationSuccess | TIsBooleanValidationError;

export default function isBoolean<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsBooleanValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined) as TIsBooleanValidationResult<Params>;
  }
  try {
    if (typeof value === 'boolean') {
      return new SuccessResult(value) as TIsBooleanValidationResult<Params>;
    }
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined) as TIsBooleanValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined) as TIsBooleanValidationResult<Params>;
  }
}

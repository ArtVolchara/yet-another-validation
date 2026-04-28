import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_DATE_ERROR_MESSAGE = 'Value should be Date' as const;

export type TIsDateValidationError = IError<typeof IS_DATE_ERROR_MESSAGE, undefined>;
export type TIsDateValidationSuccess = ISuccess<Date>;

type TIsDateValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsDateValidationSuccess | TIsDateValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsDateValidationError
      : TIsDateValidationSuccess | TIsDateValidationError;

export default function isDate<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsDateValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined) as TIsDateValidationResult<Params>;
  }
  try {
    if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value)) {
      return new SuccessResult(value as Date) as TIsDateValidationResult<Params>;
    }
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined) as TIsDateValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_DATE_ERROR_MESSAGE, undefined) as TIsDateValidationResult<Params>;
  }
}

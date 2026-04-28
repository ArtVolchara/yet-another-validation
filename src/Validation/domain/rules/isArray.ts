import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult, SuccessResult } from '../../../_Root/domain/factories';
import type { TValidationParams } from '../types/TValidator';

export const IS_ARRAY_ERROR_MESSAGE = 'Value should be array' as const;

export type TIsArrayValidationError = IError<typeof IS_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsArrayValidationSuccess = ISuccess<any[]>;

type TIsArrayValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsArrayValidationSuccess | TIsArrayValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsArrayValidationError
      : TIsArrayValidationSuccess | TIsArrayValidationError;

export default function isArray<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsArrayValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined) as TIsArrayValidationResult<Params>;
  }
  try {
    if (Array.isArray(value)) {
      return new SuccessResult(value) as TIsArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined) as TIsArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_ARRAY_ERROR_MESSAGE, undefined) as TIsArrayValidationResult<Params>;
  }
}

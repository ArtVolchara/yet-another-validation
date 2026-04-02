import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_BIGINT64_ARRAY_ERROR_MESSAGE = 'Value should be BigInt64Array' as const;

export type TIsBigInt64ArrayValidationError = IError<typeof IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsBigInt64ArrayValidationSuccess = ISuccess<BigInt64Array>;

type TIsBigInt64ArrayValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsBigInt64ArrayValidationSuccess | TIsBigInt64ArrayValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsBigInt64ArrayValidationError
      : TIsBigInt64ArrayValidationSuccess | TIsBigInt64ArrayValidationError;

export default function isBigInt64Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsBigInt64ArrayValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined) as TIsBigInt64ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof BigInt64Array) {
      return new SuccessResult(value) as TIsBigInt64ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined) as TIsBigInt64ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_BIGINT64_ARRAY_ERROR_MESSAGE, undefined) as TIsBigInt64ArrayValidationResult<Params>;
  }
}

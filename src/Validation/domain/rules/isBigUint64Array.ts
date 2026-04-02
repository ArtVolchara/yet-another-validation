import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_BIGUINT64_ARRAY_ERROR_MESSAGE = 'Value should be BigUint64Array' as const;

export type TIsBigUint64ArrayValidationError = IError<typeof IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined>;
export type TIsBigUint64ArrayValidationSuccess = ISuccess<BigUint64Array>;

type TIsBigUint64ArrayValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsBigUint64ArrayValidationSuccess | TIsBigUint64ArrayValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsBigUint64ArrayValidationError
      : TIsBigUint64ArrayValidationSuccess | TIsBigUint64ArrayValidationError;

export default function isBigUint64Array<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsBigUint64ArrayValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined) as TIsBigUint64ArrayValidationResult<Params>;
  }
  try {
    if (value instanceof BigUint64Array) {
      return new SuccessResult(value) as TIsBigUint64ArrayValidationResult<Params>;
    }
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined) as TIsBigUint64ArrayValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined) as TIsBigUint64ArrayValidationResult<Params>;
  }
}

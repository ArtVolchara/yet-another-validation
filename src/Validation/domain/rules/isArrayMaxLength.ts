import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

declare const MaxLengthBrand: unique symbol;
export type TIsArrayMaxLengthNominal<Number extends number> = { readonly [MaxLengthBrand]: `isArrayMaxLength${Number}`, };

export const generateArrayMaxLengthErrorMessage = <MaxLength extends number>(maxLength: MaxLength) => `Array should contain less than ${maxLength} elements` as const;
export type TIsArrayMaxLengthValidationError<MaxLength extends number> = IError<ReturnType<typeof generateArrayMaxLengthErrorMessage<MaxLength>>, undefined>;
export type TIsArrayMaxLengthValidationSuccess<MaxLength extends number> = ISuccess<TIsArrayMaxLengthNominal<MaxLength>>;

type TIsArrayMaxLengthValidationResult<MaxLength extends number, Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsArrayMaxLengthValidationSuccess<MaxLength> | TIsArrayMaxLengthValidationError<MaxLength>
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsArrayMaxLengthValidationError<MaxLength>
      : TIsArrayMaxLengthValidationSuccess<MaxLength> | TIsArrayMaxLengthValidationError<MaxLength>;

type TIsArrayMaxLengthValidationRule<MaxLength extends number> =
  <const Params extends TValidationParams | undefined = undefined>(
    value: Array<any>,
    params?: Params,
  ) => TIsArrayMaxLengthValidationResult<MaxLength, Params>;

export default function generateArrayMaxLengthValidationRule<MaxLength extends number>(
  maxLength: MaxLength,
): TIsArrayMaxLengthValidationRule<MaxLength> {
  function isArrayMaxLength<const Params extends TValidationParams | undefined = undefined>(
    value: Array<any>,
    params?: Params,
  ): TIsArrayMaxLengthValidationResult<MaxLength, Params> {
    if (params?.shouldReturnError === true) {
      return new ErrorResult(generateArrayMaxLengthErrorMessage<MaxLength>(maxLength), undefined) as TIsArrayMaxLengthValidationResult<MaxLength, Params>;
    }
    try {
      if (Array.isArray(value) && value.length <= maxLength) {
        return new SuccessResult(value as unknown as TIsArrayMaxLengthNominal<MaxLength>) as TIsArrayMaxLengthValidationResult<MaxLength, Params>;
      }
      return new ErrorResult(generateArrayMaxLengthErrorMessage<MaxLength>(maxLength), undefined) as TIsArrayMaxLengthValidationResult<MaxLength, Params>;
    } catch (e) {
      console.error(e);
      return new ErrorResult(generateArrayMaxLengthErrorMessage<MaxLength>(maxLength), undefined) as TIsArrayMaxLengthValidationResult<MaxLength, Params>;
    }
  }
  return isArrayMaxLength;
}
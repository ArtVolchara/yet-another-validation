import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const MaxLengthBrand: unique symbol;
export type TIsArrayMaxLengthNominal<Number extends number> = { readonly [MaxLengthBrand]: `isArrayMaxLength${Number}`, };

export type TIsArrayMaxLengthValidationError<MaxLength extends number> = IError<`Array should contain less than ${MaxLength} elements`, undefined>;
export type TIsArrayMaxLengthValidationSuccess<MaxLength extends number> = ISuccess<TIsArrayMaxLengthNominal<MaxLength>>;

type TIsArrayMaxLengthValidationRule<
  MaxLength extends number,
  DefaultError extends IError<string, any> = TIsArrayMaxLengthValidationError<MaxLength>,
> = {
  <const Error extends IError<string, undefined>>(value: Array<any>, error: Error): TIsArrayMaxLengthValidationSuccess<MaxLength> | Error;
  (value: Array<any>): TIsArrayMaxLengthValidationSuccess<MaxLength> | DefaultError;
  <
    const Error extends IError<string, undefined> | undefined = undefined,
    const Result extends undefined extends Error
      ? (TIsArrayMaxLengthValidationSuccess<MaxLength> | DefaultError)
      : (TIsArrayMaxLengthValidationSuccess<MaxLength> | Error)
    = undefined extends Error
      ? (TIsArrayMaxLengthValidationSuccess<MaxLength> | DefaultError)
      : (TIsArrayMaxLengthValidationSuccess<MaxLength> | Error),
  >(value: Array<any>, error?: Error): Result;
};

export default function generateArrayMaxLengthValidationRule<MaxLength extends number, const Error extends IError<string, undefined>>(
  maxLength: MaxLength,
  error: Error
): TIsArrayMaxLengthValidationRule<MaxLength, Error>;

export default function generateArrayMaxLengthValidationRule<MaxLength extends number>(
  maxLength: MaxLength
): TIsArrayMaxLengthValidationRule<MaxLength>;

export default function generateArrayMaxLengthValidationRule<MaxLength extends number>(
  maxLength: MaxLength,
  defaultError?: IError<string, undefined>,
) {
  return function isArrayMaxLength(
    value: Array<any>,
    error?: IError<string, undefined>,
  ) {
    try {
      if (Array.isArray(value) && value.length <= maxLength) {
        return new SuccessResult(value as unknown as TIsArrayMaxLengthNominal<MaxLength>);
      }
      if (error) {
        return error;
      }
      if (defaultError) {
        return defaultError;
      }
      return new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      if (error) {
        return error;
      }
      if (defaultError) {
        return defaultError;
      }
      return new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);
    }
  };
}

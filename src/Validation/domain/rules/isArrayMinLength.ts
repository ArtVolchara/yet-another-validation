import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';

declare const MinLengthBrand: unique symbol;
export type TIsArrayMinLengthNominal<Number extends number> = { readonly [MinLengthBrand]: `isArrayMinLength${Number}`, };

export type TIsArrayMinLengthValidationError<MinLength extends number> = IError<`Array should contain more than ${MinLength} elements`, undefined>;
export type TIsArrayMinLengthValidationSuccess<MinLength extends number> = ISuccess<TIsArrayMinLengthNominal<MinLength>>;

type TIsArrayMinLengthValidationRule<
  MinLength extends number,
  DefaultError extends IError<string, any> = TIsArrayMinLengthValidationError<MinLength>,
> = {
  <const Error extends IError<string, undefined>>(value: Array<any>, error: Error): TIsArrayMinLengthValidationSuccess<MinLength> | Error;
  (value: Array<any>): TIsArrayMinLengthValidationSuccess<MinLength> | DefaultError;
  <
    const Error extends IError<string, undefined> | undefined = undefined,
    const Result extends undefined extends Error
      ? (TIsArrayMinLengthValidationSuccess<MinLength> | DefaultError)
      : (TIsArrayMinLengthValidationSuccess<MinLength> | Error)
    = undefined extends Error
      ? (TIsArrayMinLengthValidationSuccess<MinLength> | DefaultError)
      : (TIsArrayMinLengthValidationSuccess<MinLength> | Error),
  >(value: Array<any>, error?: Error): Result;
};

export default function generateArrayMinLengthValidator<MinLength extends number, const Error extends IError<string, undefined>>(
  minLength: MinLength,
  error: Error
): TIsArrayMinLengthValidationRule<MinLength, Error>;

export default function generateArrayMinLengthValidator<MinLength extends number>(
  minLength: MinLength
): TIsArrayMinLengthValidationRule<MinLength>;

export default function generateArrayMinLengthValidator<MinLength extends number>(
  minLength: MinLength,
  defaultError?: IError<string, undefined>,
) {
  return function isArrayMinLength(
    value: Array<any>,
    error?: IError<string, undefined>,
  ) {
    try {
      if (Array.isArray(value) && value.length >= minLength) {
        return new SuccessResult(value as unknown as TIsArrayMinLengthNominal<MinLength>);
      }
      if (error) {
        return error;
      }
      if (defaultError) {
        return defaultError;
      }
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      if (error) {
        return error;
      }
      if (defaultError) {
        return defaultError;
      }
      return new ErrorResult(`Array should contain more than ${minLength} elements`, undefined);
    }
  };
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

declare const ArrayExactLengthBrand: unique symbol;
export type TIsArrayExactLengthNominal<Number extends number> = { readonly [ArrayExactLengthBrand]: `isArrayExactLength${Number}`, length: Number };

export type TIsArrayExactLengthValidationError<ExactLength extends number> = IError<`Array should contain exactly ${ExactLength} elements`, undefined>;
export type TIsArrayExactLengthValidationSuccess<ExactLength extends number> = ISuccess<TIsArrayExactLengthNominal<ExactLength>>;

type TIsArrayExactLengthValidationRule<
  ExactLength extends number,
  DefaultError extends IError<string, any> = TIsArrayExactLengthValidationError<ExactLength>,
> = {
  <const Error extends IError<string, undefined>>(value: Array<any>, error: Error): TIsArrayExactLengthValidationSuccess<ExactLength> | Error;
  (value: Array<any>): TIsArrayExactLengthValidationSuccess<ExactLength> | DefaultError;
  <
    const Error extends IError<string, undefined> | undefined = undefined,
  >(value: Array<any>, error?: Error): undefined extends Error
    ? (TIsArrayExactLengthValidationSuccess<ExactLength> | DefaultError)
    : (TIsArrayExactLengthValidationSuccess<ExactLength> | Error);
};

export default function generateArrayExactLengthValidator<ExactLength extends number, const Error extends IError<string, undefined>>(
  exactLength: ExactLength,
  error: Error
): TIsArrayExactLengthValidationRule<ExactLength, Error>;

export default function generateArrayExactLengthValidator<ExactLength extends number>(
  exactLength: ExactLength
): TIsArrayExactLengthValidationRule<ExactLength>;

export default function generateArrayExactLengthValidator<ExactLength extends number>(
  exactLength: ExactLength,
  defaultError?: IError<string, undefined>,
) {
  return function isArrayExactLength(
    value: Array<any>,
    error?: IError<string, undefined>,
  ) {
    try {
      if (Array.isArray(value) && value.length === exactLength) {
        return new SuccessResult(value as unknown as TIsArrayExactLengthNominal<ExactLength>);
      }
      if (error) {
        return error;
      }
      if (defaultError) {
        return defaultError;
      }
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined);
    } catch (e) {
      console.error(e);
      if (error) {
        return error;
      }
      if (defaultError) {
        return defaultError;
      }
      return new ErrorResult(`Array should contain exactly ${exactLength} elements`, undefined);
    }
  };
}

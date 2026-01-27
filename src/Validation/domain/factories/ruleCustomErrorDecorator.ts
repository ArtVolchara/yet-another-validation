import { IError } from 'src/_Root/domain/types/Result/IError';
import { ISuccess } from 'src/_Root/domain/types/Result/ISuccess';
import { TValidationRule } from '../types/TValidator';

type TExtractDataFromValidationRule<T> =
  T extends {
    (value: any, errorFactory: (data: infer Data) => IError<string, typeof data>): IError<string, any>;
    (value: any, error: IError<string, any>): any;
  } ? Data
    : T extends (value: any, errorFactory: (data: infer Data) => IError<string, typeof data>) => any
      ? Data
      : never;

export default function ruleCustomErrorDecorator<
  const ValidationRule extends (value: any, error: Error) => ISuccess | IError<string, any>,
  const Error extends IError<string, any>,
>(
  validationRule: ValidationRule,
  error: Error
): TValidationRule<Parameters<ValidationRule>[0], Extract<ReturnType<ValidationRule>, ISuccess>, Error>;

export default function ruleCustomErrorDecorator<
  const ValidationRule extends ((value: any, errorFactory: (data: any) => IError<string, typeof data>) => ISuccess | IError<string, any>)
  | { (value: any, errorFactory: (data: any) => IError<string, typeof data>): ISuccess | IError<string, any> },
  const CustomErrorFactory extends (data: TExtractDataFromValidationRule<ValidationRule>) => IError<string, TExtractDataFromValidationRule<ValidationRule>>,
>(
  validationRule: ValidationRule,
  errorFactory: CustomErrorFactory
): TValidationRule<Parameters<ValidationRule>[0], Extract<ReturnType<ValidationRule>, ISuccess>, ReturnType<typeof errorFactory>>;

export default function ruleCustomErrorDecorator<
  const ValidationRule extends (value: any, errorOrFactory: ErrorOrFactory) => ISuccess | IError<string, any>,
  const ErrorOrFactory extends IError<string, any> | ((data: any) => IError<string, any>),
>(validationRule: ValidationRule, errorOrFactory: Parameters<ValidationRule>[1]) {
  return (value: Parameters<ValidationRule>[0]) => validationRule(value, errorOrFactory);
}

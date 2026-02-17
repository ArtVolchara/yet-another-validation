import { ISuccess } from 'src/_Root/domain/types/Result/ISuccess';
import { IError } from 'src/_Root/domain/types/Result/IError';
import { TResult } from 'src/_Root/domain/types/Result/TResult';
import { TValidationRuleError } from '../types/TValidator';

type TResolveDecoratorParam<
  Fn extends (...args: any[]) => any,
  Param,
> = Parameters<Fn> extends [any]
  ? never
  : NonNullable<Parameters<Fn>[1]> extends (IError<string, any> | ((...args: any[]) => IError<string, any>))
    ? Param
    : never;

function customErrorDecorator<
  const CustomError extends TValidationRuleError,
  const RuleOrValidator extends (value: any, error: CustomError) => ISuccess<any> | IError<string, any>,
>(
  validationRule: RuleOrValidator,
  error: TResolveDecoratorParam<RuleOrValidator, CustomError>,
): (value: Parameters<RuleOrValidator>[0]) => TResult<
  Extract<ReturnType<RuleOrValidator>, ISuccess>,
  CustomError
>;

function customErrorDecorator<
  const RuleOrValidator extends (value: any, errorFactory: (data: any) => FactoryReturn) => ISuccess<any> | IError<string, any>,
  const FactoryReturn extends IError<string, any>,
>(
  validationRule: RuleOrValidator,
  factory: TResolveDecoratorParam<RuleOrValidator, (...args: Parameters<Parameters<RuleOrValidator>[1]>) => FactoryReturn>,
): (value: Parameters<RuleOrValidator>[0]) => TResult<
  Extract<ReturnType<RuleOrValidator>, ISuccess>,
  FactoryReturn
>;

function customErrorDecorator(
  ruleOrValidator: (...args: any[]) => any,
  errorOrFactory: any,
) {
  return (value: any) => ruleOrValidator(value, errorOrFactory);
}

export default customErrorDecorator;
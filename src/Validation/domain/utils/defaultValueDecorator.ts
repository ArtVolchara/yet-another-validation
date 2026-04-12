import { TRetrieveError, TRetrieveSuccess } from 'src/_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import {
  TValidationParams, TValidationResult, TValidationRule, TValidator,
} from '../types/TValidator';

type TDefaultValueDecoratorResult<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValue extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? TRetrieveSuccess<ReturnType<RuleOrValidator>> | ISuccess<DefaultValue>
  : [ShouldReturnError] extends [true]
    ? ISuccess<DefaultValue>
    : TRetrieveSuccess<ReturnType<RuleOrValidator>> | ISuccess<DefaultValue>;

type TDecoratedRule<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultData extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
> = <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  const ShouldReturnError extends [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
  = [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<RuleOrValidator>[0], params?: Params) => TDefaultValueDecoratorResult<RuleOrValidator, DefaultData, ShouldReturnError>;

type TNonDecoratedRule<RuleOrValidator extends TValidationRule | TValidator> = <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  const ShouldReturnError extends [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
  = [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<RuleOrValidator>[0], params?: Params) => TValidationResult<
TRetrieveSuccess<ReturnType<RuleOrValidator>>,
TRetrieveError<ReturnType<RuleOrValidator>>,
ShouldReturnError>;

type TDefaultDataFromFactoryOrValue<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) =>
    Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
> = DefaultValueOrFactory extends (error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => infer Data
  ? Data
  : DefaultValueOrFactory;

type TDefaultValueDecoratorReturn<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  IsEnabled extends boolean | undefined = undefined,
> = [IsEnabled] extends [true]
  ? TDecoratedRule<RuleOrValidator, TDefaultDataFromFactoryOrValue<RuleOrValidator, DefaultValueOrFactory>>
  : [IsEnabled] extends [false] | [undefined]
    ? TNonDecoratedRule<RuleOrValidator>
    : TDecoratedRule<RuleOrValidator, TDefaultDataFromFactoryOrValue<RuleOrValidator, DefaultValueOrFactory>>
      | TNonDecoratedRule<RuleOrValidator>;

function defaultValueDecorator<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  const IsEnabled extends boolean | undefined = undefined,
>(
  ruleOrValidator: RuleOrValidator,
  defaultValueOrFactory: DefaultValueOrFactory,
  isEnabled?: IsEnabled,
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, IsEnabled> {
  if (!isEnabled) {
    return ruleOrValidator as unknown as TDefaultValueDecoratorReturn<
    RuleOrValidator,
    DefaultValueOrFactory,
    IsEnabled
    >;
  }
  const decorated = (
    value: Parameters<typeof ruleOrValidator>[0],
    params?: Parameters<typeof ruleOrValidator>[1],
  ) => {
    const result = ruleOrValidator(value, params);
    if (result.status === 'error') {
      const defaultValue = typeof defaultValueOrFactory === 'function'
        ? defaultValueOrFactory(result)
        : defaultValueOrFactory;
      return new SuccessResult(defaultValue);
    }
    return result;
  };
  return decorated as unknown as TDefaultValueDecoratorReturn<
  RuleOrValidator,
  DefaultValueOrFactory,
  IsEnabled
  >;
}

export default defaultValueDecorator;


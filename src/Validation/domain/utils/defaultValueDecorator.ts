import { TRetrieveSuccess } from 'src/_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import { TValidationParams, TValidationRule, TValidator } from '../types/TValidator';

type TDefaultValueDecoratorResult<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValue extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? TRetrieveSuccess<ReturnType<RuleOrValidator>> | DefaultValue
  : [ShouldReturnError] extends [true]
    ? DefaultValue
    : TRetrieveSuccess<ReturnType<RuleOrValidator>> | DefaultValue;

// Перегрузка с фабрикой значения по умолчанию на основе ошибки (более специфичная — первой)
function defaultValueDecorator<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultFactory extends (
    error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>
  ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  const IsEnabled extends boolean,
>(
  ruleOrValidator: RuleOrValidator,
  defaultFactory: DefaultFactory,
  isEnabled?: IsEnabled,
): IsEnabled extends true
  ? <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  const ShouldReturnError extends [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
  = [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
  >(value: Parameters<RuleOrValidator>[0], params?: Params) => TDefaultValueDecoratorResult<RuleOrValidator, ISuccess<ReturnType<DefaultFactory>>, ShouldReturnError>
  : RuleOrValidator;

// Перегрузка со статическим значением по умолчанию
function defaultValueDecorator<
  const RuleOrValidator extends (value: any, ...args: any[]) => ISuccess | IError<string, any>,
  const DefaultValue extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  const IsEnabled extends boolean,
>(
  ruleOrValidator: RuleOrValidator,
  defaultValue: DefaultValue,
  isEnabled?: IsEnabled,
): IsEnabled extends true
  ? <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  const ShouldReturnError extends [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
  = [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
  >(value: Parameters<RuleOrValidator>[0], params?: Params) => TDefaultValueDecoratorResult<RuleOrValidator, ISuccess<DefaultValue>, ShouldReturnError>
  : RuleOrValidator;

function defaultValueDecorator<
  const RuleOrValidator extends (
    value: any, ...args: any[]) => ISuccess | IError<string, any>,
  const DefaultValueOrFactory extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | ((error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']),
  const IsEnabled extends boolean,
>(
  ruleOrValidator: RuleOrValidator,
  defaultValueOrFactory: DefaultValueOrFactory,
  isEnabled?: IsEnabled,
) {
  if (!isEnabled) {
    return ruleOrValidator;
  }
  return <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  >(value: Parameters<RuleOrValidator>[0], params?: Params) => {
    const result = ruleOrValidator(value, params);
    if (result.status === 'error') {
      const defaultValue = typeof defaultValueOrFactory === 'function'
        ? defaultValueOrFactory(result)
        : defaultValueOrFactory;
      return new SuccessResult(defaultValue);
    }
    return result;
  };
}

export default defaultValueDecorator;

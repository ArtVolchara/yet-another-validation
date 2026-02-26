import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

// Перегрузка с фабрикой значения по умолчанию на основе ошибки (более специфичная — первой)
function defaultValueDecorator<
  const RuleOrValidator extends (value: any, ...args: any[]) => ISuccess | IError<string, any>,
  const DefaultFactory extends (
    error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>
  ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  const IsEnabled extends boolean,
>(
  ruleOrValidator: RuleOrValidator,
  defaultFactory: DefaultFactory,
  isEnabled?: IsEnabled,
): IsEnabled extends true
  ? (value: Parameters<RuleOrValidator>[0]) => Extract<ReturnType<RuleOrValidator>, ISuccess> | ISuccess<ReturnType<DefaultFactory>>
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
  ? (
    value: Parameters<RuleOrValidator>[0],
  ) => Extract<ReturnType<RuleOrValidator>, ISuccess> | ISuccess<DefaultValue>
  : RuleOrValidator;

function defaultValueDecorator<
  const RuleOrValidator extends (value: any, ...args: any[]) => ISuccess | IError<string, any>,
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
  return (value: Parameters<RuleOrValidator>[0]) => {
    const result = ruleOrValidator(value);
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
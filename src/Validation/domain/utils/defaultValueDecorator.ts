import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

// Перегрузка с фабрикой значения по умолчанию на основе ошибки (более специфичная — первой)
function defaultValueDecorator<
  const RuleOrValidator extends (value: any, ...args: any[]) => ISuccess | IError<string, any>,
  const DefaultFactory extends (error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => any,
>(
  ruleOrValidator: RuleOrValidator,
  defaultFactory: DefaultFactory,
): (
  value: Parameters<RuleOrValidator>[0],
) => Extract<ReturnType<RuleOrValidator>, ISuccess> | ISuccess<ReturnType<DefaultFactory>>;

// Перегрузка со статическим значением по умолчанию
function defaultValueDecorator<
  const RuleOrValidator extends (value: any, ...args: any[]) => ISuccess | IError<string, any>,
  const DefaultValue,
>(
  ruleOrValidator: RuleOrValidator,
  defaultValue: DefaultValue,
): (
  value: Parameters<RuleOrValidator>[0],
) => Extract<ReturnType<RuleOrValidator>, ISuccess> | ISuccess<DefaultValue>;

function defaultValueDecorator<
  const RuleOrValidator extends (value: any, ...args: any[]) => ISuccess | IError<string, any>,
  const DefaultValueOrFactory,
>(
  ruleOrValidator: RuleOrValidator,
  defaultValueOrFactory: DefaultValueOrFactory,
) {
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

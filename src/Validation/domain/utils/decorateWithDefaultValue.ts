import { TRetrieveError, TRetrieveSuccess } from 'src/_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import {
  TPreserveValidatorBrand,
  TValidationParams,
  TValidationResult,
  TValidationRule,
  TValidator,
} from '../entities/TValidator';

// Условность по флагу живёт ТОЛЬКО в типе значения свойства data, а само свойство
// присутствует в error-члене всегда. Это критично для вывода: отложенный по флагу
// ЧЛЕН union'а (Error vs Error & { data }) ломает Extract<_, ISuccess> у потребителей
// (createObjectValidationRule, TSuccessValidationRulesData) при неразрешённом IsEnabled -
// success-данные схлопываются в never. Отложенное же ЗНАЧЕНИЕ свойства при фиксированном
// дискриминанте status: 'error' Extract вычисляет жадно, поэтому success остаётся чистым.
//   true              → data: DefaultData (обязательна, доступна без сужения)
//   false | undefined → data: never       (значения по умолчанию нет)
//   boolean           → data: DefaultData (значение по умолчанию типизировано, но в рантайме
//                       может отсутствовать - об этом сигнализирует статус ошибки)
// Тип ошибки собран инлайном (без отдельного alias), чтобы ховер показывал вычисленное
// пересечение TRetrieveError<...> & { data: ... }, а не нечитаемое имя алиаса.
type TDecoratedRule<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultData extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  IsEnabled extends boolean | undefined,
> = <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  const ShouldReturnError extends [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
  = [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<RuleOrValidator>[0], params?: Params) => TValidationResult<
TRetrieveSuccess<ReturnType<RuleOrValidator>>,
TRetrieveError<ReturnType<RuleOrValidator>> & {
  data: [IsEnabled] extends [false] | [undefined] ? never : DefaultData;
},
ShouldReturnError>;

type TDefaultDataFromFactoryOrValue<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>, value: Parameters<RuleOrValidator>[0]) =>
    Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
> = DefaultValueOrFactory extends (
  error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
  value: Parameters<RuleOrValidator>[0]
) => infer Data
  ? Data
  : DefaultValueOrFactory;

type TDefaultValueDecoratorReturn<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  IsEnabled extends boolean | undefined = undefined,
> = TPreserveValidatorBrand<
RuleOrValidator,
TDecoratedRule<RuleOrValidator, TDefaultDataFromFactoryOrValue<RuleOrValidator, DefaultValueOrFactory>, IsEnabled>
>;

function decorateWithDefaultValue<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
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
        ? defaultValueOrFactory(result, value)
        : defaultValueOrFactory;
      return { ...result, data: defaultValue };
    }
    return result;
  };
  return decorated as unknown as TDefaultValueDecoratorReturn<
  RuleOrValidator,
  DefaultValueOrFactory,
  IsEnabled
  >;
}
export default decorateWithDefaultValue;

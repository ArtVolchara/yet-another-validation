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

type TDefaultValueDecoratorResult<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValue extends Extract<ReturnType<RuleOrValidator>, ISuccess>['data'],
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? TRetrieveSuccess<ReturnType<RuleOrValidator>> | TRetrieveError<ReturnType<RuleOrValidator>> & { data: DefaultValue }
  : [ShouldReturnError] extends [true]
    ? TRetrieveError<ReturnType<RuleOrValidator>> & { data: DefaultValue }
    : TRetrieveSuccess<ReturnType<RuleOrValidator>> | TRetrieveError<ReturnType<RuleOrValidator>> & { data: DefaultValue };

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
    (error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>, value: Parameters<RuleOrValidator>[0]) =>
    Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
> = DefaultValueOrFactory extends (
  error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
  value: Parameters<RuleOrValidator>[0]
) => infer Data
  ? Data
  : DefaultValueOrFactory;

type TDefaultValueDecoratorReturnByFlag<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  IsEnabled extends boolean | undefined = undefined,
> = [IsEnabled] extends [true]
  ? TPreserveValidatorBrand<
  RuleOrValidator,
  TDecoratedRule<RuleOrValidator, TDefaultDataFromFactoryOrValue<RuleOrValidator, DefaultValueOrFactory>>
  >
  : [IsEnabled] extends [false] | [undefined]
    ? TPreserveValidatorBrand<RuleOrValidator, TNonDecoratedRule<RuleOrValidator>>
    : TPreserveValidatorBrand<
    RuleOrValidator,
    TDecoratedRule<RuleOrValidator, TDefaultDataFromFactoryOrValue<RuleOrValidator, DefaultValueOrFactory>>
    >
    | TPreserveValidatorBrand<RuleOrValidator, TNonDecoratedRule<RuleOrValidator>>;

type TDefaultValueDecoratorReturn<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  IsEnabled extends boolean | undefined = undefined,
> = [IsEnabled] extends [true]
  ? TDefaultValueDecoratorReturnByFlag<RuleOrValidator, DefaultValueOrFactory, true>
  : [IsEnabled] extends [false]
    ? TDefaultValueDecoratorReturnByFlag<RuleOrValidator, DefaultValueOrFactory, false>
    : [IsEnabled] extends [undefined]
      ? TDefaultValueDecoratorReturnByFlag<RuleOrValidator, DefaultValueOrFactory, undefined>
      : TDefaultValueDecoratorReturnByFlag<RuleOrValidator, DefaultValueOrFactory, boolean>;

type TDefaultValueDecoratorReturnForIsEnabled<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  IsEnabled extends boolean | undefined = undefined,
> = (
  [IsEnabled] extends [true]
    ? TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, true>
    : [IsEnabled] extends [false]
      ? TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, false>
      : [IsEnabled] extends [undefined]
        ? TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, undefined>
        : TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, boolean>
) & RuleOrValidator;

type TIsObjectValidationRule<
  RuleOrValidator extends TValidationRule | TValidator,
> = RuleOrValidator extends TValidationRule<[infer InputData], ISuccess<any>>
  ? Record<string | symbol, any> & { length?: undefined } extends InputData
    ? true
    : false
  : false;

type TDefaultValueDecoratorResolvedReturn<
  RuleOrValidator extends TValidationRule | TValidator,
  DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
  IsEnabled extends boolean | undefined = undefined,
> = TIsObjectValidationRule<RuleOrValidator> extends true
  ? TDefaultValueDecoratorReturnForIsEnabled<RuleOrValidator, DefaultValueOrFactory, IsEnabled>
  : TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, boolean>;

function decorateWithDefaultValue<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
>(
  ruleOrValidator: RuleOrValidator,
  defaultValueOrFactory: DefaultValueOrFactory,
  isEnabled: true,
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, true>;

function decorateWithDefaultValue<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
>(
  ruleOrValidator: RuleOrValidator,
  defaultValueOrFactory: DefaultValueOrFactory,
  isEnabled: false,
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, false>;

function decorateWithDefaultValue<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  | (
    (
      error: Extract<ReturnType<RuleOrValidator>, IError<string, any>>,
      value: Parameters<RuleOrValidator>[0]
    ) => Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
  ),
>(
  ruleOrValidator: RuleOrValidator,
  defaultValueOrFactory: DefaultValueOrFactory,
  isEnabled?: undefined,
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, undefined>;

function decorateWithDefaultValue<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
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
): TDefaultValueDecoratorResolvedReturn<RuleOrValidator, DefaultValueOrFactory, IsEnabled>;

function decorateWithDefaultValue<
  const RuleOrValidator extends TValidationRule | TValidator,
  const DefaultValueOrFactory extends
  | Extract<ReturnType<RuleOrValidator>, ISuccess>['data']
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
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, boolean> {
  if (!isEnabled) {
    return ruleOrValidator as unknown as TDefaultValueDecoratorReturn<
    RuleOrValidator,
    DefaultValueOrFactory,
    boolean
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
  boolean
  >;
}

export type { TDefaultValueDecoratorReturn };
export default decorateWithDefaultValue;

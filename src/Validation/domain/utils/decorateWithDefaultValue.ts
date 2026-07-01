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

// Широкий boolean-флаг (включая generic WithDefaults | undefined): в типе — как boolean,
// иначе неразрешённый generic «застревает» во вложенных composeValidator-цепочках.
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
  isEnabled?: boolean,
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, boolean>;

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
  isEnabled?: boolean,
): TDefaultValueDecoratorReturn<RuleOrValidator, DefaultValueOrFactory, boolean | undefined> {
  if (!isEnabled) {
    return ruleOrValidator as unknown as TDefaultValueDecoratorReturn<
    RuleOrValidator,
    DefaultValueOrFactory,
    boolean | undefined
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
  boolean | undefined
  >;
}

export default decorateWithDefaultValue;

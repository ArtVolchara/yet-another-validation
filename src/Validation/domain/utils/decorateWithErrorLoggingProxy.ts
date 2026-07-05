import { TRetrieveError, TRetrieveSuccess } from 'src/_Root/domain/types/Result/TResult';
import {
  TPreserveValidatorBrand,
  TValidationParams,
  TValidationRule,
  TValidator,
} from '../entities/TValidator';

type TLoggingDecoratorResult<
  RuleOrValidator extends TValidationRule | TValidator,
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? TRetrieveSuccess<ReturnType<RuleOrValidator>> | TRetrieveError<ReturnType<RuleOrValidator>>
  : [ShouldReturnError] extends [true]
    ? TRetrieveError<ReturnType<RuleOrValidator>>
    : TRetrieveSuccess<ReturnType<RuleOrValidator>> | TRetrieveError<ReturnType<RuleOrValidator>>;

type TDecoratedRule<
  RuleOrValidator extends TValidationRule | TValidator,
> = <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  const ShouldReturnError extends [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
  = [Params] extends [never]
    ? undefined
    : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<RuleOrValidator>[0], params?: Params) => TLoggingDecoratorResult<RuleOrValidator, ShouldReturnError>;

// Логирование не меняет ни сообщения, ни success-типы, поэтому бренд
// исходного валидатора сохраняется на декорированной функции как есть
type TNormalizeIsEnabled<IsEnabled extends boolean | undefined> =
  [IsEnabled] extends [true]
    ? true
    : [IsEnabled] extends [false]
      ? false
      : [IsEnabled] extends [undefined]
        ? undefined
        : [true] extends [IsEnabled]
          ? [false] extends [IsEnabled]
            ? boolean
            : true
          : [false] extends [IsEnabled]
            ? false
            : boolean extends IsEnabled
              ? boolean
              : IsEnabled;

type TLoggingDecoratorReturnImpl<
  RuleOrValidator extends TValidationRule | TValidator,
  IsEnabled extends boolean | undefined = undefined,
> = [IsEnabled] extends [true]
  ? TPreserveValidatorBrand<RuleOrValidator, TDecoratedRule<RuleOrValidator>>
  : [IsEnabled] extends [false] | [undefined]
    ? RuleOrValidator
    : TPreserveValidatorBrand<RuleOrValidator, TDecoratedRule<RuleOrValidator>> | RuleOrValidator;

type TLoggingDecoratorReturn<
  RuleOrValidator extends TValidationRule | TValidator,
  IsEnabled extends boolean | undefined = undefined,
> = TLoggingDecoratorReturnImpl<RuleOrValidator, TNormalizeIsEnabled<IsEnabled>>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: true,
  logPrefix?: string,
): TLoggingDecoratorReturnImpl<RuleOrValidator, true>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: false,
  logPrefix?: string,
): TLoggingDecoratorReturnImpl<RuleOrValidator, false>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: undefined,
  logPrefix?: string,
): TLoggingDecoratorReturnImpl<RuleOrValidator, undefined>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
  const IsEnabled extends boolean | undefined = undefined,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: IsEnabled,
  logPrefix?: string,
): TLoggingDecoratorReturnImpl<RuleOrValidator, TNormalizeIsEnabled<IsEnabled>>;

// Широкий boolean-флаг (включая generic WithLogging | undefined): в типе — как boolean,
// иначе неразрешённый generic «застревает» во вложенных composeValidator-цепочках.
function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: boolean,
  logPrefix?: string,
): TLoggingDecoratorReturnImpl<RuleOrValidator, boolean>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: boolean,
  logPrefix?: string,
): TLoggingDecoratorReturnImpl<RuleOrValidator, boolean | undefined> {
  if (!isEnabled) {
    return ruleOrValidator as unknown as TLoggingDecoratorReturnImpl<
    RuleOrValidator,
    boolean | undefined
    >;
  }

  const decorated = (
    value: Parameters<RuleOrValidator>[0],
    params?: Parameters<RuleOrValidator>[1],
  ) => {
    const result = ruleOrValidator(value, params);
    if (result.status === 'error') {
      const text = result.message;
      console.error(logPrefix ? `${logPrefix}: ${text}` : text);
    }
    return result;
  };

  return decorated as unknown as TLoggingDecoratorReturnImpl<
  RuleOrValidator,
  boolean | undefined
  >;
}

export default decorateWithErrorLoggingProxy;
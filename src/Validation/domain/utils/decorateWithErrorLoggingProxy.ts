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
type TLoggingDecoratorReturn<
  RuleOrValidator extends TValidationRule | TValidator,
  IsEnabled extends boolean | undefined = undefined,
> = [IsEnabled] extends [true]
  ? TPreserveValidatorBrand<RuleOrValidator, TDecoratedRule<RuleOrValidator>>
  : [IsEnabled] extends [false] | [undefined]
    ? RuleOrValidator
    : TPreserveValidatorBrand<RuleOrValidator, TDecoratedRule<RuleOrValidator>> | RuleOrValidator;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled: true,
  logPrefix?: string,
): TLoggingDecoratorReturn<RuleOrValidator, true>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled: false,
  logPrefix?: string,
): TLoggingDecoratorReturn<RuleOrValidator, false>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: undefined,
  logPrefix?: string,
): TLoggingDecoratorReturn<RuleOrValidator, undefined>;

// Широкий boolean-флаг (включая generic WithLogging | undefined): в типе — как boolean,
// иначе неразрешённый generic «застревает» во вложенных composeValidator-цепочках.
function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: boolean,
  logPrefix?: string,
): TLoggingDecoratorReturn<RuleOrValidator, boolean>;

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: boolean,
  logPrefix?: string,
): TLoggingDecoratorReturn<RuleOrValidator, boolean | undefined> {
  if (!isEnabled) {
    return ruleOrValidator as unknown as TLoggingDecoratorReturn<
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

  return decorated as unknown as TLoggingDecoratorReturn<
  RuleOrValidator,
  boolean | undefined
  >;
}

export default decorateWithErrorLoggingProxy;
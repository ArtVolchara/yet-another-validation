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
  const IsEnabled extends boolean | undefined = undefined,
>(
  ruleOrValidator: RuleOrValidator,
  isEnabled?: IsEnabled,
  logPrefix?: string,
): TLoggingDecoratorReturn<RuleOrValidator, IsEnabled> {
  if (!isEnabled) {
    return ruleOrValidator as unknown as TLoggingDecoratorReturn<
    RuleOrValidator,
    IsEnabled
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
  IsEnabled
  >;
}

export default decorateWithErrorLoggingProxy;
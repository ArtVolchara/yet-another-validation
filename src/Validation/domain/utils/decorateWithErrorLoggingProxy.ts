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

function decorateWithErrorLoggingProxy<
  const RuleOrValidator extends TValidationRule | TValidator,
>(
  ruleOrValidator: RuleOrValidator,
  logPrefix?: string,
): TPreserveValidatorBrand<RuleOrValidator, TDecoratedRule<RuleOrValidator>> {
  const decorated = (
    value: Parameters<typeof ruleOrValidator>[0],
    params?: Parameters<typeof ruleOrValidator>[1],
  ) => {
    const result = ruleOrValidator(value, params);
    if (result.status === 'error') {
      const text = result.message;
      console.error(logPrefix ? `${logPrefix}: ${text}` : text);
    }
    return result;
  };

  return decorated as unknown as TPreserveValidatorBrand<RuleOrValidator, TDecoratedRule<RuleOrValidator>>;
}

export default decorateWithErrorLoggingProxy;

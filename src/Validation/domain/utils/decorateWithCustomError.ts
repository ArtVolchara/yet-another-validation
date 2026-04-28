import { IError } from 'src/_Root/domain/types/Result/IError';
import { TRetrieveSuccess } from 'src/_Root/domain/types/Result/TResult';
import { TValidationParams, TValidationRule, TValidator } from '../types/TValidator';

type TCustomErrorDecoratorResult<
  RuleOrValidator extends TValidationRule | TValidator,
  CustomError extends IError<string, any>,
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? TRetrieveSuccess<ReturnType<RuleOrValidator>> | CustomError
  : [ShouldReturnError] extends [true]
    ? CustomError
    : TRetrieveSuccess<ReturnType<RuleOrValidator>> | CustomError;

function decorateWithCustomError<
  const RuleOrValidator extends TValidationRule | TValidator,
  const CustomError extends IError<string, any>,
>(
  validationRule: RuleOrValidator,
  error: CustomError,
): <

const Params extends Parameters<RuleOrValidator>[1] = undefined,
const ShouldReturnError extends [Params] extends [never]
  ? undefined
  : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
= [Params] extends [never]
  ? undefined
  : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<RuleOrValidator>[0], params?: Params) => TCustomErrorDecoratorResult<RuleOrValidator, CustomError, ShouldReturnError>;

function decorateWithCustomError<
  const RuleOrValidator extends TValidationRule | TValidator,
  const ErrorFactory extends (data: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => IError<string, any>,
>(
  validationRule: RuleOrValidator,
  factory: ErrorFactory,
): <
const Params extends Parameters<RuleOrValidator>[1] = undefined,
const ShouldReturnError extends [Params] extends [never]
  ? undefined
  : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
= [Params] extends [never]
  ? undefined
  : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<RuleOrValidator>[0], params?: Params) => TCustomErrorDecoratorResult<RuleOrValidator, ReturnType<ErrorFactory>, ShouldReturnError>;

function decorateWithCustomError<
  const RuleOrValidator extends TValidationRule | TValidator,
  const ErrorOrFactory extends IError<string, any>
  | (
    (data: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => IError<string, any>),
>(
  ruleOrValidator: RuleOrValidator,
  errorOrFactory: ErrorOrFactory,
) {
  return <
  const Params extends Parameters<RuleOrValidator>[1] = undefined,
  >(value: Parameters<RuleOrValidator>[0], params?: Params) => {
    const res = ruleOrValidator(value, params);
    if (res.status === 'error') {
      const error = typeof errorOrFactory === 'function'
        ? errorOrFactory(res as Extract<ReturnType<RuleOrValidator>, IError<string, any>>)
        : errorOrFactory;
      return error;
    }
    return res;
  };
}

export default decorateWithCustomError;
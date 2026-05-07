import { TResult, TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export type TValidationRuleError = IError<
string,
undefined | Array<IError<string, any> | undefined> | Record<string | symbol, IError<string, any> | undefined>
>;

export type TValidationParams = { shouldReturnError?: boolean };

export type TValidationResult<
  Success extends ISuccess,
  Error extends TValidationRuleError | TValidatorError,
  ShouldReturnError extends boolean | undefined,
> = [ShouldReturnError] extends [never]
  ? TResult<Success, Error>
  : [ShouldReturnError] extends [true]
    ? Error
    : TResult<Success, Error>;

// Атомарное валидационное правило
export type TValidationRule<
    Args extends [value: any, params?: TValidationParams | undefined]
    = [value: any, params?: TValidationParams | undefined],
    Success extends ISuccess = ISuccess,
    Error extends TValidationRuleError = TValidationRuleError,
    Params extends TValidationParams | undefined = undefined,
> = (...args: Args) => TValidationResult<Success, Error, NonNullable<Params>['shouldReturnError']>;

export type TValidationRules = [TValidationRule, ...Array<TValidationRule>]
| Readonly<[TValidationRule, ...Array<TValidationRule>]>;

export type TValidatorError = IError<string, Array<Array<IError<string, any>>>>;

// Валидатор - реализует возможность валидирования по принципу "ИЛИ" (OR)
export type TValidator<
    Args extends [value: any, params?: TValidationParams | undefined]
    = [value: any, params?: TValidationParams | undefined],
    Success extends ISuccess = ISuccess,
    Error extends TValidatorError = TValidatorError,
    Params extends TValidationParams | undefined = undefined,
    > = (...args: Args) => TValidationResult<Success, Error, NonNullable<Params>['shouldReturnError']>;

export type TValidators = [TValidator, ...Array<TValidator>] | Readonly<[TValidator, ...Array<TValidator>]>;

export type TRetrieveValidationInputData<Validator extends TValidator | TValidationRule> =
    Validator extends (value: infer Input) => TResult<ISuccess>
      ? Input
      : never;

export type TRetrieveValidationSuccess<Validator extends TValidator | TValidationRule> = TRetrieveSuccess<ReturnType<Validator>>;

export type TRetrieveValidationError<Validator extends TValidator | TValidationRule> = TRetrieveError<ReturnType<Validator>>;

import { TResult, TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export type TValidationRuleError = IError<
string,
undefined | Array<IError<string, any> | undefined> | Record<string | symbol, IError<string, any>>
>;

// Атомарное валидационное правило
export type TValidationRule<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends TValidationRuleError = TValidationRuleError,
> = (value: InputData) => TResult<Success, Error>;

export type TValidationRules = [TValidationRule, ...Array<TValidationRule>]
| Readonly<[TValidationRule, ...Array<TValidationRule>]>;

export type TValidatorError = IError<string, Array<Array<IError<string, any>>>>;

// Валидатор - реализует возможность валидирования по принципу "ИЛИ" (OR)
export type TValidator<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends TValidatorError = TValidatorError,
> = (value: InputData) => TResult<Success, Error>;

export type TValidators = [TValidator, ...Array<TValidator>] | Readonly<[TValidator, ...Array<TValidator>]>;

export type TRetrieveValidationInputData<Validator extends TValidator | TValidationRule> =
    Validator extends (value: infer Input) => TResult<ISuccess>
      ? Input
      : never;

export type TRetrieveValidationSuccessData<
    Validator extends TValidator | TValidationRule,
> = TRetrieveSuccess<ReturnType<Validator>>;

export type TRetrieveErrorData<
    Validator extends TValidator | TValidationRule,
> = TRetrieveError<ReturnType<Validator>>;

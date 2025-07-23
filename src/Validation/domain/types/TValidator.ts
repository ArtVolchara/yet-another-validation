import { TResult, TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

// Атомарное валидационное правило
export type TValidationRule<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends IError<string, any> = IError<string, any>,
> = <Input extends InputData = InputData>(value: Input) => TResult<Success, Error>;

export type TValidationRules = [TValidationRule, ...Array<TValidationRule>]
| Readonly<[TValidationRule, ...Array<TValidationRule>]>;

// Валидатор - реализует возможность валидирования по принципу "ИЛИ" (OR)
export type TValidator<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends IError<string, Array<Array<IError<string, any>>>
    > = IError<string, Array<Array<IError<string, any>>>>,
> = <Input extends InputData = InputData>(value: Input) => TResult<Success, Error>;

export type TValidators = [TValidator, ...Array<TValidator>] | Readonly<[TValidator, ...Array<TValidator>]>;

export type TRetrieveValidationInputData<Validator extends TValidator | TValidationRule> =
    Validator extends (value: infer ValidatorInput) => TResult<ISuccess>
      ? ValidatorInput
      : Validator extends (value: infer ValidationRuleInput) => TResult<ISuccess>
        ? ValidationRuleInput
        : never;

export type TRetrieveValidationSuccessData<
    Validator extends TValidator | TValidationRule,
> = TRetrieveSuccess<ReturnType<Validator>>;

export type TRetrieveErrorData<
    Validator extends TValidator | TValidationRule,
> = TRetrieveError<ReturnType<Validator>>;

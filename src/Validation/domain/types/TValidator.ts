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

// Readonly-варианты допустимы: const-дженерики (например, у ErrorResult) выводят
// readonly-кортежи, а рантайм validateValue массивы ошибок не мутирует
export type TValidatorError = IError<
string,
Array<Array<IError<string, any>>> | ReadonlyArray<ReadonlyArray<IError<string, any>>>
>;

// Бренд валидатора. Свойство фантомное: в рантайме оно не проставляется,
// тип навешивается через cast в composeValidator и декораторах.
export declare const meta_brand: unique symbol;

// Валидатор - реализует возможность валидирования по принципу "ИЛИ" (OR).
// Бренд встроен в сам тип: валидатором считается только функция, прошедшая через
// composeValidator или декораторы, - произвольная функция подходящей сигнатуры
// валидатором не является. Meta несёт метаданные для типового разворачивания
// вложенных валидаторов (см. TValidatorBranchesMeta/TOpaqueValidatorMeta).
export type TValidator<
    Args extends [value: any, params?: TValidationParams | undefined]
    = [value: any, params?: TValidationParams | undefined],
    Success extends ISuccess = ISuccess,
    Error extends TValidatorError = TValidatorError,
    Params extends TValidationParams | undefined = undefined,
    Meta = unknown,
> = ((...args: Args) => TValidationResult<Success, Error, NonNullable<Params>['shouldReturnError']>)
& { readonly [meta_brand]: Meta };

export type TValidators = [TValidator, ...Array<TValidator>] | Readonly<[TValidator, ...Array<TValidator>]>;

// Ветки OR-валидации: списки правил или валидаторы
export type TORValidators = Array<TValidationRules | TValidator>
| Readonly<Array<TValidationRules | TValidator>>;

// Метаданные composeValidator: исходные ветки, по которым внешний тип
// разворачивает вложенный валидатор так же, как это делает рантайм validateValue.
export type TValidatorMeta<Validators extends TORValidators = TORValidators> = {
  readonly kind: 'normal';
  readonly validatos: Validators;
};

// Метаданные «непрозрачного» валидатора (например, после decorateWithCustomError):
// внешний тип видит его как одну ветку с фиксированным union сообщений.
export type TOpaqueValidatorMeta<Message extends string = string> = {
  readonly kind: 'opaque';
  readonly message: Message;
};

export type TValidatorBrandMeta = TValidatorMeta | TOpaqueValidatorMeta;

export type TRetrieveValidatorBrandMeta<Validator> =
    Validator extends { readonly [meta_brand]: infer Meta } ? Meta : never;

// Сохранение бренда исходного валидатора на типе декорированной функции
export type TPreserveValidatorBrand<RuleOrValidator, Decorated> =
    RuleOrValidator extends { readonly [meta_brand]: infer Meta }
      ? Decorated & { readonly [meta_brand]: Meta }
      : Decorated;

export type TRetrieveValidationInputData<Validator extends TValidator | TValidationRule> =
    Validator extends (value: infer Input) => TResult<ISuccess>
      ? Input
      : never;

export type TRetrieveValidationSuccess<Validator extends TValidator | TValidationRule> = TRetrieveSuccess<ReturnType<Validator>>;

export type TRetrieveValidationError<Validator extends TValidator | TValidationRule> = TRetrieveError<ReturnType<Validator>>;

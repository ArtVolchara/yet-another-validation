import { IError } from 'src/_Root/domain/types/Result/IError';
import { TRetrieveSuccess } from 'src/_Root/domain/types/Result/TResult';
import {
  // TODO(decorateWithCustomError + validator): вернуть, когда поддержка валидаторов будет отрефакторена
  // TOpaqueValidatorMeta,
  TValidationParams,
  TValidationRule,
  // TValidator,
  // meta_brand,
} from '../entities/TValidator';

// ВНИМАНИЕ (на будущее, перед рефакторингом):
// Раньше этот декоратор поддерживал и валидаторы (результат composeValidator), помечая
// их «непрозрачной» брендовой метой TOpaqueValidatorMeta<CustomError['message']>.
// Это НЕ соответствует рантайму: внешний validateValue склеивает итоговое OR-сообщение
// и errors из ЭЛЕМЕНТОВ customError.errors (см. цикл errorsOR.forEach в validateValue),
// а вовсе не из customError.message. Поэтому opaque-мета с одним лишь message расходится
// с рантаймом, как только в errors лежит другое сообщение или несколько массивов.
// До рефакторинга поддержка валидаторов отключена - декоратор работает ТОЛЬКО с
// атомарным валидационным правилом (TValidationRule). Чтобы вернуть валидаторы, нужно
// выводить opaque-мету из customError.errors (а не из message) либо констрейнтом
// заставить errors зеркалить message.

type TCustomErrorDecoratorResult<
  Rule extends TValidationRule, // | TValidator - временно убрано, см. заметку выше
  CustomError extends IError<string, any>,
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? TRetrieveSuccess<ReturnType<Rule>> | CustomError
  : [ShouldReturnError] extends [true]
    ? CustomError
    : TRetrieveSuccess<ReturnType<Rule>> | CustomError;

type TCustomErrorDecoratedRule<
  Rule extends TValidationRule, // | TValidator - временно убрано, см. заметку выше
  CustomError extends IError<string, any>,
> = <
const Params extends Parameters<Rule>[1] = undefined,
const ShouldReturnError extends [Params] extends [never]
  ? undefined
  : Params extends TValidationParams ? Params['shouldReturnError'] : undefined
= [Params] extends [never]
  ? undefined
  : Params extends TValidationParams ? Params['shouldReturnError'] : undefined,
>(value: Parameters<Rule>[0], params?: Params) => TCustomErrorDecoratorResult<Rule, CustomError, ShouldReturnError>;

// Декоратор подменяет сообщение валидационного правила на кастомное.
// Ветка для валидаторов (opaque-мета) временно отключена, см. заметку выше.
type TCustomErrorDecoratorReturn<
  Rule extends TValidationRule, // | TValidator - временно убрано, см. заметку выше
  CustomError extends IError<string, any>,
> = TCustomErrorDecoratedRule<Rule, CustomError>;
// > = Rule extends { readonly [meta_brand]: unknown }
//   ? TCustomErrorDecoratedRule<Rule, CustomError>
//   & { readonly [meta_brand]: TOpaqueValidatorMeta<CustomError['message']> }
//   : TCustomErrorDecoratedRule<Rule, CustomError>;

function decorateWithCustomError<
  const Rule extends TValidationRule, // | TValidator - временно убрано, см. заметку выше
  const CustomError extends IError<string, any>,
>(
  validationRule: Rule,
  error: CustomError,
): TCustomErrorDecoratorReturn<Rule, CustomError>;

function decorateWithCustomError<
  const Rule extends TValidationRule, // | TValidator - временно убрано, см. заметку выше
  const ErrorFactory extends (data: Extract<ReturnType<Rule>, IError<string, any>>) => IError<string, any>,
>(
  validationRule: Rule,
  factory: ErrorFactory,
): TCustomErrorDecoratorReturn<Rule, ReturnType<ErrorFactory>>;

function decorateWithCustomError<
  const Rule extends TValidationRule, // | TValidator - временно убрано, см. заметку выше
  const ErrorOrFactory extends IError<string, any>
  | (
    (data: Extract<ReturnType<Rule>, IError<string, any>>) => IError<string, any>),
>(
  rule: Rule,
  errorOrFactory: ErrorOrFactory,
) {
  return <
  const Params extends Parameters<Rule>[1] = undefined,
  >(value: Parameters<Rule>[0], params?: Params) => {
    const res = rule(value, params);
    if (res.status === 'error') {
      const error = typeof errorOrFactory === 'function'
        ? errorOrFactory(res as Extract<ReturnType<Rule>, IError<string, any>>)
        : errorOrFactory;
      return error;
    }
    return res;
  };
}

export default decorateWithCustomError;

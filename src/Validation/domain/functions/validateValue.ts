import {
  TRetrieveValidationError,
  TRetrieveValidationInputData,
  TValidationParams,
  TValidationRule,
  TValidationRules,
  TValidator,
  TRetrieveValidationSuccess,
  TORValidators,
  TValidatorMeta,
  TOpaqueValidatorMeta,
  TRetrieveValidatorBrandMeta,
} from '../types/TValidator';
import { TRemoveReadonly } from '../../../_Root/domain/types/utils';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import { ErrorResult } from '../../../_Root/domain/factories';
import validateValueFromRules, {
  TConsistentValidationRules,
  TRebuildRuleError,
  TSuccessValidationRulesData,
  DEFAULT_AND_SEPARATOR,
} from './validateValueFromRules';

export const DEFAULT_OR_SEPARATOR = ' or ' as const;

export type { TORValidators };

export type TConsistentORValidators<ORValidators extends TORValidators> = {
  [Key in keyof ORValidators]: ORValidators[Key] extends TValidationRules
    ? TConsistentValidationRules<ORValidators[Key]>
    : ORValidators[Key]
};

export type TSuccessORValidationData<
    ORValidators extends TORValidators,
    InputData = ORValidators extends TValidator
      ? TRetrieveValidationInputData<ORValidators>
      : ORValidators extends TValidationRules | Readonly<TValidationRules>
        ? TRetrieveValidationInputData<ORValidators[0]>
        : never,
> = TRemoveReadonly<ORValidators> extends Array<infer Validators extends TValidator | TValidationRules>
  ? Validators extends TValidationRules
    ? TSuccessValidationRulesData<Validators, InputData>
    : Validators extends TValidator
      ? TRetrieveValidationSuccess<Validators>['data']
      : never
  : never;

export type TORValidationFirstParameter<ORValidators extends TORValidators> =
TRemoveReadonly<ORValidators> extends Array<infer Validators>
  ? Validators extends TValidationRules
    ? Parameters<Validators[0]>[0]
    : Validators extends TValidator
      ? Parameters<Validators>[0]
      : never
  : never;

// «Отпечаток» правила для сравнения идентичности: литерал сообщения ошибки + success-тип.
// Переживает decorateWithErrorLoggingProxy и decorateWithDefaultValue (они не меняют ни то, ни другое).
type TRuleFingerprint<Rule extends TValidationRule> = [
  TRetrieveError<ReturnType<Rule>>['message'],
  TRetrieveSuccess<ReturnType<Rule>>['data'],
];

// Сравнение через поэлементный infer: сопоставление двух инстансов одного alias
// напрямую (TRuleFingerprint<A> extends TRuleFingerprint<B>) TS срезает по variance
// и даёт ложное true, поэтому кортежи разбираются на элементы перед сравнением
type TIsSameRuleFingerprint<RuleA extends TValidationRule, RuleB extends TValidationRule> =
  TRuleFingerprint<RuleA> extends [infer MessageA, infer DataA]
    ? TRuleFingerprint<RuleB> extends [infer MessageB, infer DataB]
      ? [MessageA, DataA] extends [MessageB, DataB]
        ? [MessageB, DataB] extends [MessageA, DataA]
          ? true
          : false
        : false
      : false
    : false;

// Псевдо-ветка для «непрозрачного» валидатора: участвует только полным сообщением,
// никогда не вычитается (одноэлементная ветка при вычитании опустела бы - never)
type TOpaqueBranch<Message extends string> = [TValidationRule<[value: any], ISuccess, IError<Message, any>>];

// Разворачивание веток так же, как это делает рантайм validateValue:
// errors вложенного брендированного валидатора вливаются во внешний OR-список
export type TFlattenORBranches<ORValidators> =
  ORValidators extends readonly [infer First, ...infer Tail]
    ? First extends TValidationRules | Readonly<TValidationRules>
      ? [First, ...TFlattenORBranches<Tail>]
      : TRetrieveValidatorBrandMeta<First> extends TValidatorMeta<infer Branches>
        ? [...TFlattenORBranches<Branches>, ...TFlattenORBranches<Tail>]
        : TRetrieveValidatorBrandMeta<First> extends TOpaqueValidatorMeta<infer Message>
          ? [TOpaqueBranch<Message>, ...TFlattenORBranches<Tail>]
          : First extends TValidator
            ? [TOpaqueBranch<TRetrieveValidationError<First>['message']>, ...TFlattenORBranches<Tail>]
            : TFlattenORBranches<Tail>
    : [];

// Полное сообщение ветки: все правила упали, конкатенация без union
export type TBranchFullErrorMessage<
  Branch,
  SeparatorAND extends string,
> = Branch extends readonly [infer First extends TValidationRule]
  ? TRetrieveError<ReturnType<First>>['message']
  : Branch extends readonly [infer First extends TValidationRule, ...infer Tail]
    ? `${TRetrieveError<ReturnType<First>>['message']}${SeparatorAND}${TBranchFullErrorMessage<Tail, SeparatorAND>}`
    : never;

// Join полных сообщений всех веток; опустевшая ветка даёт never и member исчезает
type TJoinBranchesFullMessages<
  Branches,
  SeparatorAND extends string,
  SeparatorOR extends string,
> = Branches extends readonly [infer First]
  ? TBranchFullErrorMessage<First, SeparatorAND>
  : Branches extends readonly [infer First, ...infer Tail]
    ? `${TBranchFullErrorMessage<First, SeparatorAND>}${SeparatorOR}${TJoinBranchesFullMessages<Tail, SeparatorAND, SeparatorOR>}`
    : never;

// Вычитание правила из головы ветки по отпечатку (обязательное: то же правило
// на том же значении не может одновременно пройти и упасть); иначе ветка не меняется
type TSubtractRuleFromBranchHead<Branch, Rule extends TValidationRule> =
  Branch extends readonly [infer Head extends TValidationRule, ...infer Tail]
    ? TIsSameRuleFingerprint<Head, Rule> extends true
      ? Tail
      : Branch
    : Branch;

type TSubtractRuleFromBranches<Branches, Rule extends TValidationRule> =
  Branches extends readonly [infer First, ...infer Tail]
    ? [TSubtractRuleFromBranchHead<First, Rule>, ...TSubtractRuleFromBranches<Tail, Rule>]
    : [];

// Цепочка отбрасываний ведущей ветки: правила префикса отбрасываются по одному,
// каждое отброшенное вычитается из голов остальных веток. Хвост ведущей не может
// опустеть (ветка целиком прошла бы - это success, а не error), поэтому паттерн
// требует непустой LeadingTail. Результат - union «состояний»: кортежей веток-суффиксов.
type TLeadingBranchDropStates<
  LeadingBranch,
  BranchesBefore,
  BranchesAfter,
> = LeadingBranch extends readonly [infer Head extends TValidationRule, ...infer LeadingTail extends TValidationRules]
  ? [...TSubtractRuleFromBranches<BranchesBefore, Head>, LeadingTail, ...TSubtractRuleFromBranches<BranchesAfter, Head>]
  | TLeadingBranchDropStates<
  LeadingTail,
  TSubtractRuleFromBranches<BranchesBefore, Head>,
  TSubtractRuleFromBranches<BranchesAfter, Head>
  >
  : never;

// Перебор веток в роли ведущей с сохранением исходного порядка веток
type TORLeadingScenarioStates<
  RemainingBranches,
  BranchesBefore extends ReadonlyArray<unknown>,
> = RemainingBranches extends readonly [infer Leading, ...infer Tail]
  ? TLeadingBranchDropStates<Leading, BranchesBefore, Tail>
  | TORLeadingScenarioStates<Tail, [...BranchesBefore, Leading]>
  : never;

// Модель «ведущая ветка + вычитание из голов»: состояние «все ветки полные» есть всегда,
// остальные состояния порождаются цепочками отбрасываний каждой ведущей ветки.
// Из union состояний потом строятся и сообщения, и кортежи ошибок.
type TORScenarioStates<Branches> = Branches | TORLeadingScenarioStates<Branches, []>;

export type TORScenarioMessages<
  Branches,
  SeparatorAND extends string,
  SeparatorOR extends string,
> = TORScenarioStates<Branches> extends infer State
  ? State extends ReadonlyArray<unknown>
    ? TJoinBranchesFullMessages<State, SeparatorAND, SeparatorOR>
    : never
  : never;

// Полный набор ошибок ветки: кортеж пересобранных IError всех правил; пустая ветка - never
type TBranchFullErrors<Branch> =
  Branch extends readonly [infer First extends TValidationRule]
    ? [TRebuildRuleError<First>]
    : Branch extends readonly [infer First extends TValidationRule, ...infer Tail]
      ? TBranchFullErrors<Tail> extends infer TailErrors extends Array<IError<string, any>>
        ? [TRebuildRuleError<First>, ...TailErrors]
        : never
      : never;

// Кортеж «ошибки по веткам» для одного состояния; опустевшая ветка делает состояние
// недостижимым - never (аналог never от пустого шаблонного литерала в сообщениях)
type TJoinBranchesFullErrors<Branches> =
  Branches extends readonly [infer First]
    ? [TBranchFullErrors<First>] extends [never]
      ? never
      : [TBranchFullErrors<First>]
    : Branches extends readonly [infer First, ...infer Tail]
      ? [TBranchFullErrors<First>] extends [never]
        ? never
        : [TJoinBranchesFullErrors<Tail>] extends [never]
          ? never
          : TJoinBranchesFullErrors<Tail> extends infer TailBranches extends Array<Array<IError<string, any>>>
            ? [TBranchFullErrors<First>, ...TailBranches]
            : never
      : never;

// Данные ошибок по той же сценарной модели, что и сообщения: union кортежей,
// согласованных между ветками, вместо декартова произведения независимых union
export type TORScenarioErrors<Branches> =
  TORScenarioStates<Branches> extends infer State
    ? State extends ReadonlyArray<unknown>
      ? TJoinBranchesFullErrors<State>
      : never
    : never;

type TResolvedSeparatorAND<SeparatorAND extends string | undefined> =
  [SeparatorAND] extends [never | undefined]
    ? typeof DEFAULT_AND_SEPARATOR
    : string extends SeparatorAND
      ? typeof DEFAULT_AND_SEPARATOR
      : SeparatorAND extends string
        ? SeparatorAND
        : typeof DEFAULT_AND_SEPARATOR;

type TResolvedSeparatorOR<SeparatorOR extends string | undefined> =
  [SeparatorOR] extends [never | undefined]
    ? typeof DEFAULT_OR_SEPARATOR
    : string extends SeparatorOR
      ? typeof DEFAULT_OR_SEPARATOR
      : SeparatorOR extends string
        ? SeparatorOR
        : typeof DEFAULT_OR_SEPARATOR;

export type TErrorORValidationErrorMessage<
ORValidators extends TORValidators,
SeparatorOR extends string | undefined = undefined,
SeparatorAND extends string | undefined = undefined,
> = TORScenarioMessages<
TFlattenORBranches<TRemoveReadonly<ORValidators>>,
TResolvedSeparatorAND<SeparatorAND>,
TResolvedSeparatorOR<SeparatorOR>
>;

// При shouldReturnError: true рантайм безусловно возвращает ошибки всех правил всех веток,
// поэтому сообщение - единственный «полный» член без сценарного union
export type TErrorORValidationFullErrorMessage<
ORValidators extends TORValidators,
SeparatorOR extends string | undefined = undefined,
SeparatorAND extends string | undefined = undefined,
> = TJoinBranchesFullMessages<
TFlattenORBranches<TRemoveReadonly<ORValidators>>,
TResolvedSeparatorAND<SeparatorAND>,
TResolvedSeparatorOR<SeparatorOR>
>;
export type TErrorORValidationErrorData<ORValidators extends TORValidators> =
TORScenarioErrors<TFlattenORBranches<TRemoveReadonly<ORValidators>>>;

// При shouldReturnError: true рантайм собирает ошибки всех правил всех веток -
// единственный «полный» кортеж без сценарного union
export type TErrorORValidationFullErrorData<ORValidators extends TORValidators> =
TJoinBranchesFullErrors<TFlattenORBranches<TRemoveReadonly<ORValidators>>>;

// «& string» в позициях сообщения не меняет тип (там и так строки), но заставляет TS
// редуцировать пересечение: с результата слетает alias-штамп и ховер показывает
// вычисленный union литералов вместо нечитаемого TErrorORValidationErrorMessage<...>
  type TValidateValueResult<
  ORValidators extends TORValidators,
  SeparatorOR extends string | undefined = undefined,
  SeparatorAND extends string | undefined = undefined,
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? ISuccess<TSuccessORValidationData<ORValidators>>
  | IError<
  TErrorORValidationErrorMessage<ORValidators, SeparatorOR, SeparatorAND> & string,
  TErrorORValidationErrorData<ORValidators>
  >
  : [ShouldReturnError] extends [true]
    ? IError<
    TErrorORValidationFullErrorMessage<ORValidators, SeparatorOR, SeparatorAND> & string,
    TErrorORValidationFullErrorData<ORValidators>
    >
    : ISuccess<TSuccessORValidationData<ORValidators>>
    | IError<
    TErrorORValidationErrorMessage<ORValidators, SeparatorOR, SeparatorAND> & string,
    TErrorORValidationErrorData<ORValidators>
    >;

export type TParams = {
  separatorOR?: string;
  separatorAND?: string;
} & TValidationParams;

// Валидационные правила, передаваемые в pipe-функцию должны быть готовы вне зависимости от типа аргумента(но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается (не выбрасывается)
// ErrorResult c нужным message.
export default function validateValue<
    const Value extends TORValidationFirstParameter<ORValidators>,
    ORValidators extends TORValidators,
    const Params extends TParams | undefined | null = undefined,
    const SeparatorOR extends [Params] extends [never]
      ? typeof DEFAULT_OR_SEPARATOR
      : Params extends TParams ? Params['separatorOR'] : typeof DEFAULT_OR_SEPARATOR
    = [Params] extends [never]
      ? typeof DEFAULT_OR_SEPARATOR
      : Params extends TParams ? Params['separatorOR'] : typeof DEFAULT_OR_SEPARATOR,
    const SeparatorAND extends [Params] extends [never]
      ? typeof DEFAULT_AND_SEPARATOR
      : Params extends TParams ? Params['separatorAND'] : typeof DEFAULT_AND_SEPARATOR
    = [Params] extends [never]
      ? typeof DEFAULT_AND_SEPARATOR
      : Params extends TParams ? Params['separatorAND'] : typeof DEFAULT_AND_SEPARATOR,
    const ShouldReturnError extends [Params] extends [never]
      ? undefined
      : Params extends TParams ? Params['shouldReturnError'] : undefined
    = [Params] extends [never]
      ? undefined
      : Params extends TParams ? Params['shouldReturnError'] : undefined,
>(
  value: Value,
  validatorsOrRules: TConsistentORValidators<ORValidators>,
  params?: Params,
): TValidateValueResult<ORValidators, SeparatorOR, SeparatorAND, ShouldReturnError> {
  const errors = [] as Array<Array<IError<string, any>>>;
  // eslint-disable-next-line no-restricted-syntax
  for (const validator of validatorsOrRules) {
    if (Array.isArray(validator)) {
      const result = validateValueFromRules.apply(null, [
        value,
        validator,
        { separator: params?.separatorAND, shouldReturnError: params?.shouldReturnError },
      ]);
      if (result.status === 'error') {
        const errorsAND = result.errors;
        errors.push(errorsAND);
      } else {
        return result as TValidateValueResult<ORValidators, SeparatorOR, SeparatorAND, ShouldReturnError>;
      }
    } else if (validator instanceof Function) {
      const result = validator(value, { shouldReturnError: params?.shouldReturnError });
      if (result.status === 'error') {
        const errorsOR = result.errors;
        if (errorsOR) {
          errorsOR.forEach((errorsAND) => {
            if (Array.isArray(errorsAND)) {
              errors.push(errorsAND);
            }
          });
        }
      } else {
        return result as TValidateValueResult<ORValidators, SeparatorOR, SeparatorAND, ShouldReturnError>;
      }
    }
  }
  const error = new ErrorResult(
    errors.map((localErrors) => localErrors.map(
      (el) => el.message,
    )?.join(params?.separatorAND || DEFAULT_AND_SEPARATOR))?.join(params?.separatorOR || DEFAULT_OR_SEPARATOR),
    errors as TErrorORValidationErrorData<ORValidators>,
  ) as TValidateValueResult<ORValidators, SeparatorOR, SeparatorAND, ShouldReturnError>;
  return error;
}
import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccess,
  TValidationRule,
  TValidationRules,
} from '../entities/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IsAnyOrUnknown, TUnionToIntersection } from '../../../_Root/domain/types/utils';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { IError, isInternalError } from '../../../_Root/domain/types/Result/IError';
import { SuccessResult, ErrorResult } from '../../../_Root/domain/factories';

export const DEFAULT_AND_SEPARATOR = '. ' as const;

export type TConsistentValidationRules<
  ValidationRules extends Partial<TValidationRules>,
> = ValidationRules extends readonly [infer First extends TValidationRule]
  ? First extends TValidationRule<[infer InputData]>
    ? IsAnyOrUnknown<InputData> extends true
      ? Readonly<[First]>
      : Readonly<[TValidationRule<any>]>
    : Readonly<[TValidationRule<any>]>
  : ValidationRules extends readonly [infer First extends TValidationRule, ...infer Tail extends Partial<TValidationRules>]
    ? First extends TValidationRule<[infer InputData], ISuccess<infer RuleSuccessData>>
      ? IsAnyOrUnknown<InputData> extends true
        ? Readonly<[First, ...TConsistentValidationRulesWithoutAnyAndUnknown<Tail, RuleSuccessData>]>
        : Readonly<[TValidationRule<any>, ...Tail]>
      : Readonly<[TValidationRule<any>, ...Tail]>
    : ValidationRules;

type TConsistentValidationRulesWithoutAnyAndUnknown<
ValidationRules extends Partial<TValidationRules>,
PrevRulesSuccessDataIntersection = unknown,
> = ValidationRules extends readonly [TValidationRule<[infer InputData]>]
  ? IsAnyOrUnknown<InputData> extends false
    ? PrevRulesSuccessDataIntersection extends InputData
      ? ValidationRules
      : Readonly<[TValidationRule<[PrevRulesSuccessDataIntersection]>]>
      // если оставить следующую строку вместо never, то желанной ошибки не будет
      // (value: any) => TResult<ISuccess<any>, IError<string, undefined>> принимается,
      // даже не смотря что требуется TValidationRule<например string>
      // : Readonly<[TValidationRule<[PrevRulesSuccessDataIntersection]>]>
    : never
  : ValidationRules extends readonly [infer First extends TValidationRule, ...infer Tail extends Partial<TValidationRules>]
    ? First extends TValidationRule<[infer InputData], ISuccess<infer RuleSuccessData>>
      ? IsAnyOrUnknown<InputData> extends false
        ? PrevRulesSuccessDataIntersection extends InputData
          ? Readonly<[First, ...TConsistentValidationRulesWithoutAnyAndUnknown<Tail, PrevRulesSuccessDataIntersection & RuleSuccessData>]>
          : Readonly<[TValidationRule<[PrevRulesSuccessDataIntersection]>, ...Tail]>
        : Readonly<[TValidationRule<[unknown]>, ...Tail]>
      : Readonly<[TValidationRule<[PrevRulesSuccessDataIntersection]>, ...Tail]>
    : ValidationRules;

export type TSuccessValidationRulesData<
    ValidationRules extends TValidationRules,
    InputData = ValidationRules[0] extends TValidationRule
      ? TRetrieveValidationInputData<ValidationRules[0]>
      : ValidationRules[0],
> = ValidationRules extends readonly [TValidationRule<[InputData], ISuccess<infer SuccessValidationRulesData>>]
  ? SuccessValidationRulesData
  : ValidationRules extends readonly [infer First extends TValidationRule<[InputData]>, ...infer Tail extends TValidationRules]
    ? TRetrieveValidationSuccess<First>['data'] & TSuccessValidationRulesData<Tail, InputData>
    : TUnionToIntersection<ValidationRules extends Array<TValidationRule<any, ISuccess<infer DesiredType>>>
      ? DesiredType
      : never
    >;

export type TErrorValidationMessage<
ValidationRules extends TValidationRules,
Separator extends string | undefined = undefined,
> =
  ValidationRules extends readonly [infer First extends TValidationRule<any, any>]
    ? TRetrieveError<ReturnType<First>>['message']
    : ValidationRules extends readonly [
      infer First extends TValidationRule<any, any>,
      ...infer Tail extends TValidationRules,
    ]
      ? Separator extends string
        ? TErrorValidationMessage<Tail>
        | `${TRetrieveError<ReturnType<First>>['message']}${Separator}${TErrorValidationMessage<Tail, Separator>}`
        : TErrorValidationMessage<Tail>
        | `${TRetrieveError<ReturnType<First>>['message']}${TErrorValidationMessage<Tail>}`
      : '';

// Ошибка правила пересобирается в IError<Message, Errors> заново: получается свежий тип
// без alias-штампа, и ховер показывает литерал сообщения вместо имени алиаса правила
// (IError<'Value should be number', undefined> вместо TIsNumberValidationError).
// Остальные поля (valid, data и т.п.) собираются mapped-типом по RuleError, а не через
// Omit<RuleError, 'message' | 'errors'>: Omit ховером показывает исходный RuleError
// целиком нераскрытым (дублирование и нечитаемость), а mapped-тип вычисляет и
// показывает каждое поле развёрнутым.
export type TRebuildRuleError<Rule extends TValidationRule<any, any>> =
  TRetrieveError<ReturnType<Rule>> extends infer RuleError extends IError<string, any>
    ? RuleError extends IError<infer Message, infer Errors>
      // status исключён из "остальных" полей: IError<Message, Errors> уже даёт его
      // чистым литералом TErrorStatus, а у RuleError (ErrorResult) он объявлен как
      // IError<Message, Errors>['status'] и не сворачивается в ховере
      ? IError<Message, Errors> & { [Key in keyof RuleError as Exclude<Key, 'message' | 'errors' | 'status'>]: RuleError[Key] }
      : never
    : never;

export type TErrorValidationRulesData<ValidationRules extends TValidationRules> =
  ValidationRules extends readonly [infer First extends TValidationRule<any, any>]
    ? [TRebuildRuleError<First>]
    : ValidationRules extends readonly [
      infer First extends TValidationRule<any, any>,
      ...infer Tail extends TValidationRules,
    ]
      ? TErrorValidationRulesData<Tail> | [TRebuildRuleError<First>, ...TErrorValidationRulesData<Tail>]
      : never;

// «& string» заставляет TS редуцировать пересечение: с типа сообщения слетает
// alias-штамп и ховер показывает вычисленный union литералов
type TValidateValueFromRulesResult<
  Rules extends TValidationRules,
  Separator extends string | undefined = undefined,
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? ISuccess<TSuccessValidationRulesData<Rules>>
  | IError<TErrorValidationMessage<Rules, Separator> & string, TErrorValidationRulesData<Rules>>
  : [ShouldReturnError] extends [true]
    ? IError<TErrorValidationMessage<Rules, Separator> & string, TErrorValidationRulesData<Rules>>
    : ISuccess<TSuccessValidationRulesData<Rules>>
    | IError<TErrorValidationMessage<Rules, Separator> & string, TErrorValidationRulesData<Rules>>;

export default function validateValueFromRules<
  const Value,
  const Rules extends TValidationRules,
  const Params extends { separator?: string, shouldReturnError?: boolean } | undefined = undefined,
  const Separator extends Params extends { separator?: infer Separator }
    ? undefined extends Separator ? typeof DEFAULT_AND_SEPARATOR : Separator
    : typeof DEFAULT_AND_SEPARATOR
  = Params extends { separator?: infer Separator }
    ? undefined extends Separator ? typeof DEFAULT_AND_SEPARATOR : Separator
    : typeof DEFAULT_AND_SEPARATOR,
>(
  value: Value,
  rules: TConsistentValidationRules<Rules>,
  params?: Params,
): TValidateValueFromRulesResult<Rules, Separator, NonNullable<Params>['shouldReturnError']> {
  const localErrors = [] as Array<IError<string, any>>;
  const result = rules.reduce((acc, rule) => {
    try {
      // После первого падения весь хвост цепочки падает принудительно:
      // сообщение ветки всегда ровно суффикс правил, как и в типовой модели
      const res = rule(acc, { shouldReturnError: params?.shouldReturnError === true || localErrors.length > 0 });
      if (res.status === 'error') {
        localErrors.push(res);
        return acc;
      }
      return res.data;
    } catch (e) {
      if (isInternalError(e)) {
        localErrors.push(e);
      }
    }
  }, value as any);
  if (!localErrors.length) {
    return new SuccessResult(result) as TValidateValueFromRulesResult<Rules, Separator, NonNullable<Params>['shouldReturnError']>;
  }
  return new ErrorResult(
    localErrors.map((el) => el.message)?.join(params?.separator || DEFAULT_AND_SEPARATOR),
    localErrors,
  ) as TValidateValueFromRulesResult<Rules, Separator, NonNullable<Params>['shouldReturnError']>;
}

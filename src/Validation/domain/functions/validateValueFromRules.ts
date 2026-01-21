import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidationRule,
  TValidationRules,
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IsAnyOrUnknown, TUnionToIntersection } from '../../../_Root/domain/types/utils';
import { TResult, TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { IError, isInternalError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import isString from '../rules/isString';
import isNumber from '../rules/isNumber';
import isOnlyDigitsString from '../rules/isOnlyDigitsString';
import isPositiveNumber from '../rules/isPositiveNumber';

export const DEFAULT_AND_SEPARATOR = '. ' as const;

// export type TGetConsistentValidationRulesWithCheckedInput<
// ValidationRules extends Partial<TValidationRules>,
// InputData = ValidationRules[0] extends TValidationRule<infer Input> ? Input : never,
// > = ValidationRules extends [TValidationRule<InputData>]
//   ? TConsistentValidationRules<ValidationRules>
//   : ValidationRules extends [infer First, ...infer Tail extends Partial<TValidationRules>]
//     ? First extends TValidationRule<InputData, ISuccess<infer RuleSuccessData>>
//       ? [First, ...TConsistentValidationRules<Tail, RuleSuccessData>]
//       : [TValidationRule<InputData>, ...Tail]
//     : ValidationRules;

export type TGetConsistentValidationRulesWithCheckedInput<
ValidationRules extends Partial<TValidationRules>,
> = ValidationRules extends [infer First, ...infer Tail extends Partial<TValidationRules>]
  ? First extends TValidationRule<infer FirstInput>
    ? IsAnyOrUnknown<FirstInput> extends true
      ? First extends TValidationRule<any, ISuccess<infer RuleSuccessData>>
        ? Tail extends []
          ? [First]
          : [First, ...TConsistentValidationRules<Tail, RuleSuccessData>]
        : [TValidationRule<unknown>, ...Tail]
      : [TValidationRule<unknown>, ...Tail]
    : [TValidationRule<unknown>, ...Tail]
  : ValidationRules;

type TConsistentValidationRules<
ValidationRules extends Partial<TValidationRules>,
PrevRulesSuccessDataIntersection = unknown,
> = ValidationRules extends [TValidationRule<PrevRulesSuccessDataIntersection>]
  ? [TValidationRule<PrevRulesSuccessDataIntersection>]
  : ValidationRules extends [infer First, ...infer Tail extends Partial<TValidationRules>]
    ? First extends TValidationRule<infer FirstInput>
      ? IsAnyOrUnknown<FirstInput> extends true
        ? IsAnyOrUnknown<PrevRulesSuccessDataIntersection> extends true
          ? First extends TValidationRule<PrevRulesSuccessDataIntersection, ISuccess<infer RuleSuccessData>>
            ? [First, ...TConsistentValidationRules<Tail, PrevRulesSuccessDataIntersection & RuleSuccessData>]
            : [TValidationRule<PrevRulesSuccessDataIntersection>, ...Tail]
          : never
        : First extends TValidationRule<PrevRulesSuccessDataIntersection, ISuccess<infer RuleSuccessData>>
          ? [First, ...TConsistentValidationRules<Tail, PrevRulesSuccessDataIntersection & RuleSuccessData>]
          : [TValidationRule<PrevRulesSuccessDataIntersection>, ...Tail]
      : [TValidationRule<PrevRulesSuccessDataIntersection>, ...Tail]
    : ValidationRules;

export type TSuccessValidationRulesData<
    ValidationRules extends TValidationRules,
    InputData = ValidationRules[0] extends TValidationRule
      ? TRetrieveValidationInputData<ValidationRules[0]>
      : ValidationRules[0],
> = ValidationRules extends [TValidationRule<InputData, ISuccess<infer SuccessValidationRulesData>>]
  ? SuccessValidationRulesData
  : ValidationRules extends [
    infer First extends TValidationRule<InputData>,
    ...infer Tail extends TValidationRules,
  ]
    ? TRetrieveValidationSuccessData<First>['data'] & TSuccessValidationRulesData<Tail, InputData>
    : TUnionToIntersection<ValidationRules extends Array<TValidationRule<any, ISuccess<infer DesiredType>>>
      ? DesiredType
      : never
    >;

export type TErrorValidationMessage<
ValidationRules extends TValidationRules,
Separator extends string | undefined = undefined,
> =
  ValidationRules extends [infer First extends TValidationRule<any, any>]
    ? TRetrieveError<ReturnType<First>>['message']
    : ValidationRules extends [
      infer First extends TValidationRule<any, any>,
      ...infer Tail extends TValidationRules,
    ]
      ? Separator extends string
        ? `${TRetrieveError<ReturnType<First>>['message']}${Separator}${TErrorValidationMessage<Tail, Separator>}`
        : `${TRetrieveError<ReturnType<First>>['message']}${TErrorValidationMessage<Tail>}`
      : '';

export type TErrorValidationRulesData<ValidationRules extends TValidationRules> =
  ValidationRules extends [infer First extends TValidationRule<any, any>]
    ? [TRetrieveError<ReturnType<First>>]
    : ValidationRules extends [
      infer First extends TValidationRule<any, any>,
      ...infer Tail extends TValidationRules,
    ]
      ? TErrorValidationRulesData<Tail> | [TRetrieveError<ReturnType<First>>, ...TErrorValidationRulesData<Tail>]
      : never;

export default function validateValueFromRules<
  const Value,
  const Rules extends TValidationRules,
  const Params extends { separator?: string } = { separator: typeof DEFAULT_AND_SEPARATOR },
  const Separator extends Params['separator'] extends string ? Params['separator'] : typeof DEFAULT_AND_SEPARATOR
  = Params['separator'] extends string ? Params['separator'] : typeof DEFAULT_AND_SEPARATOR ,
>(
  value: Value,
  rules: TGetConsistentValidationRulesWithCheckedInput<Rules>,
  params?: Params,
) {
  const localErrors = [] as Array<IError<string, any>>;
  const result = rules.reduce((acc, validator) => {
    try {
      const res = (validator as any)(acc);
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
    return new SuccessResult(result) as ISuccess<TSuccessValidationRulesData<Rules, Value>>;
  }
  return new ErrorResult(
    localErrors.map((el) => el.message)?.join(params?.separator || DEFAULT_AND_SEPARATOR),
    localErrors,
  ) as IError<
  TErrorValidationMessage<Rules, Separator>,
  TErrorValidationRulesData<Rules>
  >;
}

const aaaa = validateValueFromRules(30, [isString, isNumber]);
const bbbb = validateValueFromRules('ass', [isString, isOnlyDigitsString]);
const bbbb2 = validateValueFromRules('ass', [isString, isOnlyDigitsString, isPositiveNumber]);
const сссс = validateValueFromRules('ass', [isString, isPositiveNumber]);
const dddd = validateValueFromRules(46, [isPositiveNumber]);
const eeee = validateValueFromRules(30, [isString]);
const ffff = validateValueFromRules(30, []);
const gggg = validateValueFromRules(30, [(value: any[]) => ({} as TResult<ISuccess<any[]>, IError<string, undefined>>)]);

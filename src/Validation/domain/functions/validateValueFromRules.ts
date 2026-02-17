import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidationRule,
  TValidationRules,
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IsAnyOrUnknown, TUnionToIntersection } from '../../../_Root/domain/types/utils';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { IError, isInternalError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export const DEFAULT_AND_SEPARATOR = '. ' as const;

export type TConsistentValidationRules<
  ValidationRules extends Partial<TValidationRules>,
> = ValidationRules extends [infer First extends TValidationRule]
  ? First extends TValidationRule<infer InputData>
    ? IsAnyOrUnknown<InputData> extends true
      ? [First]
      : [TValidationRule<unknown>]
    : [TValidationRule<unknown>]
  : ValidationRules extends [infer First extends TValidationRule, ...infer Tail extends Partial<TValidationRules>]
    ? First extends TValidationRule<infer InputData, ISuccess<infer RuleSuccessData>>
      ? IsAnyOrUnknown<InputData> extends true
        ? [First, ...TConsistentValidationRulesWithoutAnyAndUnknown<Tail, RuleSuccessData>]
        : [TValidationRule<unknown>, ...Tail]
      : [TValidationRule<unknown>, ...Tail]
    : ValidationRules;

type TConsistentValidationRulesWithoutAnyAndUnknown<
ValidationRules extends Partial<TValidationRules>,
PrevRulesSuccessDataIntersection = unknown,
> = ValidationRules extends [TValidationRule<infer InputData>]
  ? IsAnyOrUnknown<InputData> extends false
    ? InputData extends PrevRulesSuccessDataIntersection
      ? ValidationRules
      : [TValidationRule<PrevRulesSuccessDataIntersection>]
      // если оставить следующую строку вместо never, то желанной ошибки не будет
      // (value: any) => TResult<ISuccess<any>, IError<string, undefined>> принимается,
      // даже не смотря что требуется TValidationRule<например string>
      // : [TValidationRule<PrevRulesSuccessDataIntersection>]
    : never
  : ValidationRules extends [infer First extends TValidationRule, ...infer Tail extends Partial<TValidationRules>]
    ? First extends TValidationRule<infer InputData, ISuccess<infer RuleSuccessData>>
      ? IsAnyOrUnknown<InputData> extends false
        ? InputData extends PrevRulesSuccessDataIntersection
          ? [First, ...TConsistentValidationRulesWithoutAnyAndUnknown<Tail, PrevRulesSuccessDataIntersection & RuleSuccessData>]
          : [TValidationRule<PrevRulesSuccessDataIntersection>, ...Tail]
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
  : ValidationRules extends [infer First extends TValidationRule<InputData>, ...infer Tail extends TValidationRules]
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
        ? TErrorValidationMessage<Tail>
        | `${TRetrieveError<ReturnType<First>>['message']}${Separator}${TErrorValidationMessage<Tail, Separator>}`
        : TErrorValidationMessage<Tail>
        | `${TRetrieveError<ReturnType<First>>['message']}${TErrorValidationMessage<Tail>}`
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
  rules: TConsistentValidationRules<Rules>,
  params?: Params,
) {
  const localErrors = [] as Array<IError<string, any>>;
  const result = rules.reduce((acc, validator) => {
    try {
      const res = validator(acc);
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

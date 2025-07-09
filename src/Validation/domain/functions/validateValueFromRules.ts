import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidationRule,
  TValidationRules,
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TUnionToIntersection } from '../../../_Root/domain/types/utils';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { IError, isInternalError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export type TConsistentValidationRules<
ValidationRules extends Partial<TValidationRules>,
InputData = ValidationRules[0] extends TValidationRule<infer Input> ? Input : never,
> = ValidationRules extends [infer First, ...infer Tail]
  ? First extends TValidationRule<InputData>
    ? [
      TValidationRule<InputData>,
      ...TConsistentValidationRules<
      Tail extends TValidationRules ? Tail : [],
      First extends TValidationRule<InputData, ISuccess<infer SuccessValidationRulesData>>
        ? InputData & SuccessValidationRulesData
        : never>,
    ]
    : [
      TValidationRule<InputData>,
      ...(Tail extends TValidationRules ? Tail : []),
    ]
  : ValidationRules;

export type TSuccessValidationRulesData<
    ValidationRules extends TValidationRules,
    InputData = ValidationRules[0] extends TValidationRule
      ? TRetrieveValidationInputData<ValidationRules[0]>
      : ValidationRules[0],
> =
ValidationRules extends [
  TValidationRule<InputData, ISuccess<infer SuccessValidationRulesData>>,
]
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

export type TErrorValidationMessage<ValidationRules extends TValidationRules> =
  ValidationRules extends [infer First extends TValidationRule<any, any>]
    ? TRetrieveError<ReturnType<First>>['message']
    : ValidationRules extends [
      infer First extends TValidationRule<any, any>,
      ...infer Tail extends TValidationRules,
    ]
      ? TErrorValidationMessage<Tail>
      | `${TRetrieveError<ReturnType<First>>['message']}. ${TErrorValidationMessage<Tail>}`
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
>(
  value: Value,
  ...validationRules: TConsistentValidationRules<Rules, Value>
) {
  const localErrors = [] as Array<IError<string, any>>;
  const result = validationRules.reduce((acc, validator) => {
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
    localErrors.map((el) => el.message)?.join('. '),
    localErrors,
  ) as IError<TErrorValidationMessage<Rules>, TErrorValidationRulesData<Rules>>;
}

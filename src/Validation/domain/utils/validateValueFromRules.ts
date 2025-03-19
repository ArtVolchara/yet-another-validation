import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidationRule,
  TValidationRules
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { TStringUnionCombosConcat, TUnionCombosTuples, TUnionToIntersection } from '../../../_Root/domain/types/utils';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { IError, isInternalError } from '../../../_Root/domain/types/Result/IError';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export type TConsistentValidationRules<
    ValidationRules extends TValidationRules | Readonly<TValidationRules>,
    InputData = ValidationRules[0] extends TValidationRule<infer InputData, any> ? InputData : never,
> = ValidationRules extends [infer First, ...infer Tail]
  ? [
    TValidationRule<InputData>,
    ...TConsistentValidationRules<
    Tail extends TValidationRules | Readonly<TValidationRules> ? Tail : never,
    First extends TValidationRule<InputData, ISuccess<infer SuccessValidationRulesData>>
      ? InputData & SuccessValidationRulesData
      : never>,
  ]
  : ValidationRules;

export type TSuccessValidationRulesData<
    ValidationRules extends TValidationRules | Readonly<TValidationRules>,
    InputData = TRetrieveValidationInputData<ValidationRules[0]>,
> =
    ValidationRules extends [TValidationRule<InputData, ISuccess<infer SuccessValidationRulesData>>]
      ? SuccessValidationRulesData
      : ValidationRules extends [infer First extends TValidationRule<InputData>, ...infer Tail extends [TValidationRule, ...TValidationRules]]
        ? TRetrieveValidationSuccessData<First>['data'] & TSuccessValidationRulesData<Tail, InputData>
        : TUnionToIntersection<ValidationRules extends Array<TValidationRule<any, infer DesiredType>> ? DesiredType : never>;

export type TErrorValidationMessage<ValidationRules extends TValidationRules | Readonly<TValidationRules>> =
    ValidationRules extends Array<infer ValidationRulesUnion extends TValidationRule<any, any>>
      ? TStringUnionCombosConcat<TRetrieveError<ReturnType<ValidationRulesUnion>>['message'], '. '>
      : '';

export type TErrorValidationRulesData<ValidationRules extends TValidationRules | Readonly<TValidationRules>> =
    ValidationRules extends Array<infer ValidationRulesUnion extends TValidationRule>
      ? TUnionCombosTuples<TRetrieveError<ReturnType<ValidationRulesUnion>>>
      : never;

export default function validateValueFromRules<
    const Value extends Parameters<ValidationRules[0]>[0],
    const ValidationRules extends TValidationRules = [],
>(
  value: Value,
  validators: TConsistentValidationRules<ValidationRules>,
) {
  const localErrors = [] as Array<IError<string, any>>;
  const result = validators.reduce((acc, validator) => {
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
  }, value);
  if (!localErrors.length) {
    return new SuccessResult(result) as ISuccess<TSuccessValidationRulesData<ValidationRules, Value>>;
  }
  return new ErrorResult(
    localErrors.map((el) => el.message)?.join('. '),
    localErrors,
  ) as IError<TErrorValidationMessage<ValidationRules>, TErrorValidationRulesData<ValidationRules>>;
}

import { ISuccess } from 'src/_Root/domain/types/Result/ISuccess';
import { ErrorResult } from '@validation/utils';
import { TRetrieveError } from 'src/_Root/domain/types/Result/TResult';
import { isArray, isNumber, isUndefined } from '@validation/rules';
import { TValidationRule, TValidationRuleError, TValidationRules } from '../types/TValidator';
import composeValidator from './composeValidator';
import isString from '../rules/isString';
import isOnlyEnglishLettersString from '../rules/isOnlyEnglishLettersString';
import createArrayValidationRule from './createArrayValidationRule';
import createObjectValidationRule from './createObjectValidationRule';
import createTupleValidationRule from './createTupleValidationRule';

function ruleCustomErrorDecorator<
  const ValidationRule extends {
    (
      value: any,
      errorOrFactory?: ((data: any) => TValidationRuleError) | { (data: any): TValidationRuleError } | TValidationRuleError
    ): ISuccess | TValidationRuleError
  } | ((
    value: any,
    errorOrFactory?: ((data: any) => TValidationRuleError) | { (data: any): TValidationRuleError } | TValidationRuleError
  ) => ISuccess | TValidationRuleError
  ),
  const ErrorOrFactory extends Parameters<ValidationRule>[1],
>(
  validationRule: ValidationRule,
  errorOrFactory?: ErrorOrFactory,
): TValidationRule<
Parameters<ValidationRule>[0],
Extract<ReturnType<ValidationRule>, ISuccess>,
undefined extends ErrorOrFactory
  ? TRetrieveError<ReturnType<ValidationRule>>
  : (
    ErrorOrFactory extends TValidationRuleError
      ? ErrorOrFactory
      : ReturnType<Exclude<ErrorOrFactory, undefined | TValidationRuleError>>
  )
>;

function ruleCustomErrorDecorator<
   const ValidationRule extends { (value: any, errorOrFactory: ErrorOrFactory): ISuccess | TValidationRuleError },
   const ErrorOrFactory extends TValidationRuleError | ((data: any) => TValidationRuleError),
>(rule: ValidationRule, errorOrFactory: Parameters<ValidationRule>[1]) {
  return (value: Parameters<ValidationRule>[0]) => rule(value, errorOrFactory);
}

export default ruleCustomErrorDecorator;

// const validator = composeValidator([[isString, isOnlyEnglishLettersString], [isUndefined]]);
// const arrayRule = createArrayValidationRule(validator);
// const tupleRule = createTupleValidationRule([validator]);
// const res1 = arrayRule([])
// const res2 = tupleRule([1]);
// if (res2.status === 'error') {
//   const aa = res2.data;
// }
// const objectRule = createObjectValidationRule({ a: validator, b: composeValidator([[isNumber], [isUndefined]]) });
// const objectRule2 = createObjectValidationRule({ a: validator, b: composeValidator([[isNumber], [isUndefined]]) }, (data) => new ErrorResult('bla', data));
// const res3 = objectRule([]);

// const rule1 = ruleCustomErrorDecorator(isString, new ErrorResult('Custom error', undefined));
// const rule2 = ruleCustomErrorDecorator(objectRule, new ErrorResult('Custom error', undefined));
// const rule3 = ruleCustomErrorDecorator(objectRule2, (data) => new ErrorResult('Custom error', data));
// const rule4 = ruleCustomErrorDecorator(() => new ErrorResult('1', undefined));
// const rule6 = ruleCustomErrorDecorator(tupleRule, (data) => new ErrorResult('Custom error', data));
// const rule7 = ruleCustomErrorDecorator(tupleRule, new ErrorResult('Custom error', undefined));
// const rule8 = ruleCustomErrorDecorator(arrayRule, (data) => new ErrorResult('Custom error', data));
// const rule9 = ruleCustomErrorDecorator(arrayRule, new ErrorResult('Custom error', undefined));
// const rule10 = ruleCustomErrorDecorator(isOnlyEnglishLettersString, new ErrorResult('Custom error', undefined));
// const rule11 = ruleCustomErrorDecorator(validator, (data) => new ErrorResult('Custom error', data));
// // const validatorr = validatorCustomErrorDecorator(validator, (data) => new ErrorResult('Custom error', data));
// // const validatorr2 = validatorCustomErrorDecorator(validator, new ErrorResult('Custom error', undefined));

// function decorateRules<Rules extends {
//   (
//     value: any,
//     errorOrFactory?: ((data: any) => TValidationRuleError) | { (data: any): TValidationRuleError } | TValidationRuleError
//   ): ISuccess | TValidationRuleError
// }[]>(rules: Rules) {
//   return rules.map((rule) => ruleCustomErrorDecorator(rule, new ErrorResult('Custom error', undefined)));
// }
// const res = decorateRules([isString, isOnlyEnglishLettersString] as const);

// // const complexValidator = composeValidator([decorateRules([isString, isOnlyEnglishLettersString]), [isUndefined]], { separatorOR: '|' });

import {
  TRetrieveValidationInputData,
  TValidationRules,
  TValidator,
} from '../types/TValidator';
import {
  Flatten,
  TConcatWithSeparator,
} from '../../../_Root/domain/types/utils';
import { TRetrieveError, TRetrieveSuccess } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import validateValueFromRules, {
  TConsistentValidationRules,
  TErrorValidationRulesData,
  TSuccessValidationRulesData,
} from './validateValueFromRules';
import { TRemoveReadonly } from '../types/TRemoveReadonly';

export type TConsistentORValidators<ORValidators extends Partial<TORValidators>> = {
  [Key in keyof ORValidators]: ORValidators[Key] extends TValidationRules
    ? TConsistentValidationRules<ORValidators[Key]>
    : ORValidators[Key]
};

export type TORValidators = Array<TValidationRules | TValidator> | Readonly<Array<TValidationRules | TValidator>>;

export type TSuccessORValidationData<
    ORValidators extends TORValidators,
    InputData = ORValidators extends TValidator
      ? TRetrieveValidationInputData<ORValidators>
      : ORValidators extends TValidationRules | Readonly<TValidationRules>
        ? TRetrieveValidationInputData<ORValidators[0]>
        : never,
> =
TRemoveReadonly<ORValidators> extends Array<infer Validators extends TValidator | TValidationRules>
  ? Validators extends TValidationRules
    ? TSuccessValidationRulesData<Validators, InputData>
    : Validators extends TValidator
      ? TRetrieveSuccess<ReturnType<Validators>>['data']
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

export type TErrorsANDToMessages<Errors extends Array<IError<string, any>>> = Errors extends [
  infer First extends IError<string, any>,
  ...infer Tail extends Array<IError<string, any>>,
]
  ? [First['message'], ...TErrorsANDToMessages<Tail>]
  : [];

export type TORErrorsToMessages<
  ORErrors extends Array<Array<IError<string, any>>>,
  > = ORErrors extends [infer First extends Array<IError<string, any>>, ...infer Tail]
    ? [
      TConcatWithSeparator<TErrorsANDToMessages<First>, '. '>,
      ...TORErrorsToMessages<Tail extends Array<Array<IError<string, any>>> ? Tail : []>,
    ]
    : [];

export type TErrorORValidationErrorMessage<ORValidators extends TORValidators> = TConcatWithSeparator<
TORErrorsToMessages<TErrorORValidationErrorData<ORValidators>>,
' OR '
>;

export type TErrorORValidationErrorData<
ORValidators extends TORValidators,
> =
TRemoveReadonly<ORValidators> extends [
  infer First extends TValidator | TValidationRules,
  ...infer Tail extends TORValidators,
]
  ? [
    First extends TValidator
      ? Flatten<TRetrieveError<ReturnType<First>>['data']>
      : First extends TValidationRules | Readonly<TValidationRules>
        ? TErrorValidationRulesData<First>
        : never,
    ...TErrorORValidationErrorData<Tail>,
  ]
  : [];

// Валидационные правила, передаваемые в pipe-функцию должны быть готовы вне зависимости от типа аргумента(но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается (не выбрасывается)
// ErrorResult c нужным message.
export default function validateValue<
    const Value extends TORValidationFirstParameter<ORValidators>,
    const ORValidators extends TORValidators = [],
>(
  value: Value,
  ...orValidators: TConsistentORValidators<ORValidators>
) {
  const errors = [] as Array<Array<IError<string, any>>>;

  // eslint-disable-next-line no-restricted-syntax
  for (const validator of orValidators) {
    if (Array.isArray(validator)) {
      const result = validateValueFromRules.apply(null, [value, ...validator]);
      if (result.status === 'error') {
        const errorsAND = result.data;
        errors.push(errorsAND);
      } else {
        return result as ISuccess<TSuccessORValidationData<ORValidators>>;
      }
    } else if (validator instanceof Function) {
      const result = validator(value);
      if (result.status === 'error') {
        const errorsOR = result.data;
        if (errorsOR) {
          errorsOR.forEach((errorsAND) => {
            if (Array.isArray(errorsAND)) {
              errors.push(errorsAND);
            }
          });
        }
      } else {
        return result as ISuccess<TSuccessORValidationData<ORValidators>>;
      }
    }
  }
  return new ErrorResult(
    errors.map((localErrors) => localErrors.map(
      (el) => el.message,
    )?.join('. '))?.join(' OR '),
    errors as TErrorORValidationErrorData<ORValidators>,
  ) as IError<TErrorORValidationErrorMessage<ORValidators>, TErrorORValidationErrorData<ORValidators>>;
}

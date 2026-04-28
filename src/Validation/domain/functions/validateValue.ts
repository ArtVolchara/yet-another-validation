import {
  TRetrieveValidationError,
  TRetrieveValidationInputData,
  TValidationParams,
  TValidationRules,
  TValidator,
  TRetrieveValidationSuccess,
} from '../types/TValidator';
import {
  TConcatWithSeparator,
  TRemoveReadonly,
} from '../../../_Root/domain/types/utils';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import { ErrorResult } from '../../../_Root/domain/factories';
import validateValueFromRules, {
  TConsistentValidationRules,
  TErrorValidationRulesData,
  TSuccessValidationRulesData,
  TErrorValidationMessage,
  DEFAULT_AND_SEPARATOR,
} from './validateValueFromRules';

export const DEFAULT_OR_SEPARATOR = ' or ' as const;

export type TConsistentORValidators<ORValidators extends TORValidators> = {
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

export type TORValidationErrorsMessages<
  ORValidators extends TORValidators,
  SeparatorAND extends string | undefined = undefined,
  > = ORValidators extends [infer First extends TValidator | TValidationRules, ...infer Tail]
    ? First extends TValidator
      ? [
        TRetrieveValidationError<First>['message'],
        ...TORValidationErrorsMessages<Tail extends TORValidators ? Tail : []>,
      ]
      : First extends TValidationRules
        ? [
          TErrorValidationMessage<First, SeparatorAND>,
          ...TORValidationErrorsMessages<Tail extends TORValidators ? Tail : [], SeparatorAND>,
        ]
        : []
    : [];

export type TErrorORValidationErrorMessage<
ORValidators extends TORValidators,
SeparatorOR extends string | undefined = undefined,
SeparatorAND extends string | undefined = undefined,
> = TConcatWithSeparator<
TORValidationErrorsMessages<
ORValidators,
[SeparatorAND] extends [never | undefined]
  ? typeof DEFAULT_AND_SEPARATOR
  : string extends SeparatorAND
    ? typeof DEFAULT_AND_SEPARATOR
    : SeparatorAND
>,
[SeparatorOR] extends [never | undefined]
  ? typeof DEFAULT_OR_SEPARATOR
  : string extends SeparatorOR
    ? typeof DEFAULT_OR_SEPARATOR
    : SeparatorOR extends string
      ? SeparatorOR
      : typeof DEFAULT_OR_SEPARATOR
>;
export type TErrorORValidationErrorData<ORValidators extends TORValidators> =
TRemoveReadonly<ORValidators> extends [
  infer First extends TValidator | TValidationRules,
  ...infer Tail extends TORValidators,
]
  ? First extends TValidator
    ? [...TRetrieveValidationError<First>['errors'], ...TErrorORValidationErrorData<Tail>]
    : First extends TValidationRules | Readonly<TValidationRules>
      ? [TErrorValidationRulesData<First>, ...TErrorORValidationErrorData<Tail>]
      : []
  : [];

  type TValidateValueResult<
  ORValidators extends TORValidators,
  SeparatorOR extends string | undefined = undefined,
  SeparatorAND extends string | undefined = undefined,
  ShouldReturnError extends boolean | undefined = undefined,
> = [ShouldReturnError] extends [never]
  ? ISuccess<TSuccessORValidationData<ORValidators>>
  | IError<
  TErrorORValidationErrorMessage<ORValidators, SeparatorOR, SeparatorAND>,
  TErrorORValidationErrorData<ORValidators>
  >
  : [ShouldReturnError] extends [true]
    ? IError<
    TErrorORValidationErrorMessage<ORValidators, SeparatorOR, SeparatorAND>,
    TErrorORValidationErrorData<ORValidators>
    >
    : ISuccess<TSuccessORValidationData<ORValidators>>
    | IError<
    TErrorORValidationErrorMessage<ORValidators, SeparatorOR, SeparatorAND>,
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

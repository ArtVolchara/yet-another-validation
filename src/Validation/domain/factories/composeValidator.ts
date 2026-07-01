import validateValue, {
  TConsistentORValidators, TORValidationFirstParameter,
} from '../functions/validateValue';
import {
  TORValidators,
  TValidationParams,
  TValidatorMeta,
  meta_brand,
} from '../entities/TValidator';

type MergeComposeValidatorParams<
  ValidationParams extends TValidationParams | undefined,
  ComposerParams extends { separatorOR?: string, separatorAND?: string } | undefined ,
> = [ValidationParams, ComposerParams] extends [undefined, undefined] | [never, never]
  ? undefined
  : [ValidationParams] extends [undefined | never]
    ? ComposerParams
    : [ComposerParams] extends [undefined | never]
      ? ValidationParams
      : ValidationParams & ComposerParams;

// Валидационные правила, передаваемые в pipe-функцию должны быть готовы вне зависимости от типа аргумента(но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается(не выбрасывается)
// ErrorResult c нужным message.
export default function composeValidator<
  ORValidators extends TORValidators,
  const ComposerParams extends { separatorOR?: string, separatorAND?: string } | undefined = undefined,
  >(
  orValidators: TConsistentORValidators<ORValidators>,
  composerParams?: ComposerParams,
) {
  const validator = <
    const Value extends TORValidationFirstParameter<ORValidators>,
    const ValidationParams extends TValidationParams | undefined = undefined,
  >(
      value: Value,
      validationParams?: ValidationParams,
    ) => validateValue<Value, ORValidators, MergeComposeValidatorParams<ValidationParams, ComposerParams>>(
      value,
      orValidators,
      { ...(composerParams || {}), ...(validationParams || {}) } as MergeComposeValidatorParams<ValidationParams, ComposerParams>,
    );
  // Бренд фантомный: метаданные исходных веток позволяют внешнему validateValue
  // развернуть вложенный валидатор в типах так же, как это делает рантайм
  return validator as typeof validator & { readonly [meta_brand]: TValidatorMeta<ORValidators> };
}

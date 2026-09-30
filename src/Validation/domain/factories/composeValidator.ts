import validateValue, {
  TConsistentORValidators, TORValidationFirstParameter, TParams,
} from '../functions/validateValue';
import {
  TORValidators,
  TValidatorMeta,
  meta_brand,
} from '../entities/TValidator';
import { TOverrideParams } from '../../../_Root/domain/types/utils';

type TResolvedComposeValidatorParams<
  CreateParams extends TParams | undefined,
  CallParams extends TParams | undefined,
> = TOverrideParams<CreateParams, CallParams, 'separatorOR' | 'separatorAND' | 'shouldReturnError'>;

// Валидационные правила, передаваемые в pipe-функцию должны быть готовы вне зависимости от типа аргумента(но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается(не выбрасывается)
// ErrorResult c нужным message.
export default function composeValidator<
  ORValidators extends TORValidators,
  const ComposerParams extends TParams | undefined = undefined,
>(
  orValidators: TConsistentORValidators<ORValidators>,
  composerParams?: ComposerParams,
) {
  const validator = <
    const Value extends TORValidationFirstParameter<ORValidators>,
    const ValidationParams extends TParams | undefined = undefined,
  >(
      value: Value,
      validationParams?: ValidationParams,
    ) => validateValue<Value, ORValidators, TResolvedComposeValidatorParams<ComposerParams, ValidationParams>>(
      value,
      orValidators,
      {
        separatorOR: validationParams?.separatorOR ?? composerParams?.separatorOR,
        separatorAND: validationParams?.separatorAND ?? composerParams?.separatorAND,
        shouldReturnError: validationParams?.shouldReturnError ?? composerParams?.shouldReturnError,
      } as TResolvedComposeValidatorParams<ComposerParams, ValidationParams>,
    );
  // Бренд фантомный: метаданные исходных веток позволяют внешнему validateValue
  // развернуть вложенный валидатор в типах так же, как это делает рантайм
  return validator as typeof validator & { readonly [meta_brand]: TValidatorMeta<ORValidators> };
}

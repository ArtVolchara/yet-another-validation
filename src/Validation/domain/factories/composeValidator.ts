import validateValue, {
  DEFAULT_OR_SEPARATOR,
  TConsistentORValidators, TORValidationFirstParameter, TORValidators,
  TValidationParams,
} from '../functions/validateValue';
import { DEFAULT_AND_SEPARATOR } from '../functions/validateValueFromRules';

// Валидационные правила, передаваемые в pipe-функцию должны быть готовы вне зависимости от типа аргумента(но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается(не выбрасывается)
// ErrorResult c нужным message.
export default function composeValidator<
  ORValidators extends TORValidators,
  const SeparatorOR extends string = typeof DEFAULT_OR_SEPARATOR,
  const SeparatorAND extends string= typeof DEFAULT_AND_SEPARATOR,
  >(
  orValidators: TConsistentORValidators<ORValidators>,
  params?: TValidationParams<ORValidators, SeparatorOR, SeparatorAND>,
) {
  return <const Value extends TORValidationFirstParameter<ORValidators>>(
    value: Value,
  ) => validateValue<Value, ORValidators, SeparatorOR, SeparatorAND>(value, orValidators, params);
}
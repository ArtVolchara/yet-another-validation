import validateValue, {
  TConsistentORValidators, TORValidationFirstParameter, TORValidators,
} from '../functions/validateValue';

// Валидационные правила, передаваемые в pipe-функцию должны быть готовы вне зависимости от типа аргумента(но тип нужен)
// обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается(не выбрасывается)
// ErrorResult c нужным message.
export default function composeValidator<
  const ORValidators extends TORValidators = [],
>(
  ...orValidators: TConsistentORValidators<ORValidators>
) {
  return <
    const Value extends TORValidationFirstParameter<ORValidators>,
  >(
    value: Value,
  ) => validateValue<Value, ORValidators>(value, ...orValidators);
}

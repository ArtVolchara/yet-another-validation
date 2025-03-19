import isString from './src/Validation/domain/validators/isString';
import isOnlyDigitsString from './src/Validation/domain/validators/isOnlyDigitsString';
import composeValidator from './src/Validation/domain/utils/composeValidator';
import isUndefined from './src/Validation/domain/validators/isUndefined';
import isOnlyEnglishLettersString from './src/Validation/domain/validators/isOnlyEnglishLettersString';
import createObjectValidationRule from './src/Validation/domain/utils/createObjectValidationRule';
import createArrayValidatorRule from './src/Validation/domain/utils/createArrayValidatorRule';
import createTupleValidatorRule from './src/Validation/domain/utils/createTupleValidatorRule';
import generateArrayExactLengthValidator from './src/Validation/domain/validators/isArrayExactLength';

const stringValidator = composeValidator([[isString, isOnlyEnglishLettersString], [isUndefined]]);
const stringValidationResult = stringValidator(undefined);
if (stringValidationResult.status === 'success') {
  const { data } = stringValidationResult;
}
if (stringValidationResult.status === 'error') {
  const { message, data } = stringValidationResult;
}
// console.log(stringValidationResult);

const workplaceSchema = {
  position: composeValidator([[isString, isOnlyEnglishLettersString]]),
  company: composeValidator([[isString, isOnlyEnglishLettersString]]),
};
const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
const workplaceValidator = composeValidator([[workplaceValidationRule], [isUndefined]]);
const workPlaceValidationResult = workplaceValidator({ position: '1', company: 'w' });
if (workPlaceValidationResult.status === 'success') {
  const { data } = workPlaceValidationResult;
}
if (workPlaceValidationResult.status === 'error') {
  const { message, data } = workPlaceValidationResult;
}
const valSchema1 = {
  id: composeValidator([[isOnlyDigitsString]]),
  name: composeValidator([[isString, isOnlyEnglishLettersString]]),
  workplace: composeValidator([workplaceValidator, [isUndefined]]),
};
const valValidationRule = createObjectValidationRule(valSchema1);
const objValidator = composeValidator([[valValidationRule]]);
const objValidationResult = objValidator({ id: 'a', name: '', workplace: { position: '1', company: 'w' } });

if (objValidationResult.status === 'success') {
  const data = objValidationResult?.data;
}
if (objValidationResult.status === 'error') {
  const { message, data } = objValidationResult;
}
// console.log(objValidationResult.data);

const arrValidatorRule = createArrayValidatorRule(workplaceValidator);
const arrValidator = composeValidator([[arrValidatorRule, generateArrayExactLengthValidator(5)]]);

const arrValidationResult = arrValidator([{ position: '1', company: 'w' }, { position: '1', company: '1' }]);

if (arrValidationResult.status === 'success') {
  const { data } = arrValidationResult;
}
if (arrValidationResult.status === 'error') {
  const { message, data } = arrValidationResult;
  console.log(arrValidationResult);
}

const tupleValidatorRule = createTupleValidatorRule([workplaceValidator]);
const tupleValidator = composeValidator([[tupleValidatorRule], [isUndefined]]);

const tupleValidationResult = tupleValidator([{ position: '1', company: 'w' }]);

if (tupleValidationResult.status === 'success') {
  const { data } = tupleValidationResult;
}
if (tupleValidationResult.status === 'error') {
  const { message, data } = tupleValidationResult;
  // console.log(data);
}

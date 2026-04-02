import { describe, test, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import isUndefined from '../../rules/isUndefined';
import createObjectValidationRule, {
  DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR,
  DEFAULT_ERROR_MESSAGE_HYPERNYM,
  DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR,
} from '../createObjectValidationRule';
import composeValidator from '../composeValidator';

describe('createObjectValidationRule', () => {
  describe('createObjectValidationRule error cases', () => {
    test('Should fail when all object fields do not match validators', () => {
      const inputValue = { name: 123, age: 'not a number' };
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`name${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`age${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.name).toBeDefined();
        expect(actualResult?.data?.age).toBeDefined();
      }
    });

    test('Should fail when single field is invalid', () => {
      const inputValue = { name: 123 };
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
      });

      const actualResult = objectValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`name${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult?.data?.name).toBeDefined();
      }
    });

    test('Should fail only for invalid fields in complex object', () => {
      const inputValue = { name: 'Bob', age: -5, isActive: 'true', score: 100 };
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber, isPositiveNumber]]),
        isActive: composeValidator([[isBoolean]]),
        score: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`age${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`isActive${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.name).toBeUndefined();
        expect(actualResult?.data?.age).toBeDefined();
        expect(actualResult?.data?.isActive).toBeDefined();
        expect(actualResult?.data?.score).toBeUndefined();
      }
    });

    test('Should fail for all fields when all are invalid', () => {
      const inputValue = { name: 123, age: 'not a number', isActive: null };
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
        isActive: composeValidator([[isBoolean]]),
      });

      const actualResult = objectValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`name${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`age${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`isActive${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult?.data?.name).toBeDefined();
        expect(actualResult?.data?.age).toBeDefined();
        expect(actualResult?.data?.isActive).toBeDefined();
      }
    });

    test('Should fail when OR-validator field matches neither branch', () => {
      const objectValidationRule = createObjectValidationRule({
        optionalField: composeValidator([[isString], [isUndefined]]),
      });

      const actualResult = objectValidationRule({ optionalField: 123 });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`optionalField${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult?.data?.optionalField).toBeDefined();
      }
    });

    test('Should fail with shouldReturnError when input is not an object', () => {
      const inputValue = 'not an object';
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule(inputValue as any);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`name${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`age${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.name).toBeDefined();
        expect(actualResult?.data?.age).toBeDefined();
      }
    });

    test('Should fail when field value is undefined but validator requires number', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule({ name: 'John', age: undefined } as any);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult?.data?.age).toBeDefined();
        const ageError = actualResult.data?.age as any;
        expect(ageError.status).toBe('error');
        expect(ageError.message).toContain('number');
      }
    });

    test('Should have correct error data structure with per-field errors', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule({ name: 123, age: 'invalid' });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(typeof actualResult.data).toBe('object');
        expect(actualResult.data).toHaveProperty('name');
        expect(actualResult.data).toHaveProperty('age');
        expect(actualResult.data?.name).toHaveProperty('status', 'error');
        expect(actualResult.data?.name).toHaveProperty('message');
        expect(actualResult.data?.age).toHaveProperty('status', 'error');
        expect(actualResult.data?.age).toHaveProperty('message');
      }
    });

    test('Should have correct per-field error messages in complex schema', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber, isPositiveNumber]]),
        isActive: composeValidator([[isBoolean]]),
        score: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule({ name: 'John123', age: -5, isActive: 'true', score: 95.5 });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        const ageError = actualResult.data?.age as any;
        expect(ageError?.status).toBe('error');
        expect(ageError?.message).toContain('positive number');
        const isActiveError = actualResult.data?.isActive as any;
        expect(isActiveError?.status).toBe('error');
        expect(isActiveError?.message).toContain('boolean');
      }
    });

    test('Should use custom errorMessageHypernym', () => {
      const customHypernym = 'Custom object error';
      const objectValidationRule = createObjectValidationRule(
        { name: composeValidator([[isString]]) },
        { errorMessageHypernym: customHypernym },
      );

      const actualResult = objectValidationRule({ name: 123 });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(customHypernym);
        expect(actualResult.message).not.toContain(DEFAULT_ERROR_MESSAGE_HYPERNYM);
      }
    });

    test('Should use custom errorMessageHypernymSeparator', () => {
      const customSeparator = ' ->';
      const objectValidationRule = createObjectValidationRule(
        { name: composeValidator([[isString]]) },
        { errorMessageHypernymSeparator: customSeparator },
      );

      const actualResult = objectValidationRule({ name: 123 });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${customSeparator}`);
      }
    });

    test('Should use custom errorMessageFieldSeparator', () => {
      const customSeparator = ' => ';
      const objectValidationRule = createObjectValidationRule(
        { name: composeValidator([[isString]]) },
        { errorMessageFieldSeparator: customSeparator },
      );

      const actualResult = objectValidationRule({ name: 123 });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`name${customSeparator}`);
      }
    });

    test('Should return error when shouldReturnError is true even for valid simple object', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule({ name: 'John', age: 25 }, { shouldReturnError: true });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`name${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`age${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult?.data?.name).toBeDefined();
        expect(actualResult?.data?.age).toBeDefined();
      }
    });

    test('Should return error when shouldReturnError is true even for valid complex object', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber, isPositiveNumber]]),
        isActive: composeValidator([[isBoolean]]),
        score: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule(
        { name: 'Alice', age: 30, isActive: true, score: 95.5 },
        { shouldReturnError: true },
      );

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`name${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`age${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`isActive${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult.message).toContain(`score${DEFAULT_ERROR_MESSAGE_FIELD_SEPARATOR}`);
        expect(actualResult?.data?.name).toBeDefined();
        expect(actualResult?.data?.age).toBeDefined();
        expect(actualResult?.data?.isActive).toBeDefined();
        expect(actualResult?.data?.score).toBeDefined();
      }
    });
  });

  describe('createObjectValidationRule success cases', () => {
    test('Should validate object with string and number fields', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule({ name: 'John', age: 25 });

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual({ name: 'John', age: 25 });
      }
    });

    test('Should validate object with single field', () => {
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
      });

      const actualResult = objectValidationRule({ name: 'Single' });

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual({ name: 'Single' });
      }
    });

    test('Should validate complex object with multiple field types', () => {
      const inputValue = { name: 'Alice', age: 30, isActive: true, score: 95.5 };
      const objectValidationRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber, isPositiveNumber]]),
        isActive: composeValidator([[isBoolean]]),
        score: composeValidator([[isNumber]]),
      });

      const actualResult = objectValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(inputValue);
      }
    });

    test('Should validate optional field when value is a string', () => {
      const objectValidationRule = createObjectValidationRule({
        optionalField: composeValidator([[isString], [isUndefined]]),
      });

      const actualResult = objectValidationRule({ optionalField: 'test' });

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual({ optionalField: 'test' });
      }
    });

    test('Should validate optional field when value is undefined', () => {
      const objectValidationRule = createObjectValidationRule({
        optionalField: composeValidator([[isString], [isUndefined]]),
      });

      const actualResult = objectValidationRule({ optionalField: undefined });

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual({ optionalField: undefined });
      }
    });

    test('Should successfully validate empty object with empty schema', () => {
      const objectValidationRule = createObjectValidationRule({});

      const actualResult = objectValidationRule({});

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual({});
      }
    });
  });
});

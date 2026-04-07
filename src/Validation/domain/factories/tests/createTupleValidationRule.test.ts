import { describe, test, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import isArray from '../../rules/isArray';
import isOnlyEnglishLettersString from '../../rules/isOnlyEnglishLettersString';
import isUndefined from '../../rules/isUndefined';
import isObject from '../../rules/isObject';
import createTupleValidationRule, {
  TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM,
  TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR,
  TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR,
} from '../createTupleValidationRule';
import createObjectValidationRule from '../createObjectValidationRule';
import composeValidator from '../composeValidator';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import { TValidationParams, TValidator } from '../../types/TValidator';

describe('createTupleValidationRule', () => {
  describe('createTupleValidationRule error cases', () => {
    test('Should fail when tuple elements do not match validators', () => {
      const inputValue = [123, 'not a number'] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    test('Should fail with shouldReturnError when input is not an array', () => {
      const inputValue = 'not an array';
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);

      const actualResult = tupleValidationRule(inputValue as any);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    test('Should fail when some tuple elements are invalid in complex tuple', () => {
      const inputValue = ['Bob', -5, 'not boolean', [1, 2, 3]] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber, isPositiveNumber]]),
        composeValidator([[isBoolean]]),
        composeValidator([[isArray]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`2${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeUndefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
        expect(actualResult?.data?.[3]).toBeUndefined();
      }
    });

    test('Should fail when OR-validator tuple element matches neither branch', () => {
      const inputValue = ['a', 123] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString], [isUndefined]]),
        composeValidator([[isString], [isUndefined]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    test('Should fail when single element tuple is invalid', () => {
      const inputValue = [123] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeDefined();
      }
    });

    test('Should fail with all indices when all tuple elements are invalid', () => {
      const inputValue = [null, 'not a number'] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    test('Should format error messages with correct element indices', () => {
      const inputValue = [123, 'invalid', false] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
        composeValidator([[isBoolean]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should use custom errorMessageHypernym', () => {
      const inputValue = [123, 'not a number'] as const;
      const customHypernym = 'Custom tuple error';
      const tupleValidationRule = createTupleValidationRule(
        [composeValidator([[isString]]), composeValidator([[isNumber]])],
        { errorMessageHypernym: customHypernym },
      );

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(customHypernym);
        expect(actualResult.message).not.toContain(TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM);
      }
    });

    test('Should use custom errorMessageHypernymSeparator', () => {
      const inputValue = [123, 'not a number'] as const;
      const customSeparator = ' ->';
      const tupleValidationRule = createTupleValidationRule(
        [composeValidator([[isString]]), composeValidator([[isNumber]])],
        { errorMessageHypernymSeparator: customSeparator },
      );

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${customSeparator}`);
      }
    });

    test('Should use custom errorMessageIndexSeparator', () => {
      const inputValue = [123, 'not a number'] as const;
      const customSeparator = ' => ';
      const tupleValidationRule = createTupleValidationRule(
        [composeValidator([[isString]]), composeValidator([[isNumber]])],
        { errorMessageIndexSeparator: customSeparator },
      );

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`0${customSeparator}`);
        expect(actualResult.message).toContain(`1${customSeparator}`);
      }
    });

    test('Should have correct nested error structure with object validation inside tuple', () => {
      const workplaceSchema = {
        position: composeValidator([[isString, isOnlyEnglishLettersString]]),
        company: composeValidator([[isString, isOnlyEnglishLettersString]]),
      };
      const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
      const workplaceValidator = composeValidator([[isObject, workplaceValidationRule]]);
      const tupleValidationRule = createTupleValidationRule([workplaceValidator]);
      const inputValue = [[{ position: '1', company: 'w' }]];

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toHaveLength(1);
        const firstElementError = actualResult.data?.[0];
        expect(firstElementError).toBeDefined();
        if (firstElementError && typeof firstElementError === 'object' && 'status' in firstElementError) {
          const elementError = firstElementError as any;
          expect(elementError.status).toBe('error');
          expect(typeof elementError.message).toBe('string');
          expect(typeof elementError.data).toBe('object');
          expect(elementError.data).not.toBeNull();
        }
      }
    });

    test('Should return error when shouldReturnError is true even for valid simple tuple', () => {
      const inputValue = ['Hello', 42] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);

      const actualResult = tupleValidationRule(inputValue, { shouldReturnError: true });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    test('Should return error when shouldReturnError is true even for valid complex tuple', () => {
      const inputValue = ['Alice', 30, true, [1, 2, 3]] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber, isPositiveNumber]]),
        composeValidator([[isBoolean]]),
        composeValidator([[isArray]]),
      ]);

      const actualResult = tupleValidationRule(inputValue, { shouldReturnError: true });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM}${TUPLE_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`2${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`3${TUPLE_DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
        expect(actualResult?.data?.[3]).toBeDefined();
      }
    });
  });

  describe('createTupleValidationRule success cases', () => {
    test('Should validate simple tuple with string and number', () => {
      const inputValue = ['Hello', 42] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['Hello', 42]);
      }
    });

    test('Should validate complex tuple with multiple types', () => {
      const inputValue = ['Alice', 30, true, [1, 2, 3]] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber, isPositiveNumber]]),
        composeValidator([[isBoolean]]),
        composeValidator([[isArray]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['Alice', 30, true, [1, 2, 3]]);
      }
    });

    test('Should validate tuple with OR-validator elements', () => {
      const inputValue = ['a', undefined] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString], [isUndefined]]),
        composeValidator([[isString], [isUndefined]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['a', undefined]);
      }
    });

    test('Should validate single element tuple', () => {
      const inputValue = ['Single'] as const;
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
      ]);

      const actualResult = tupleValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['Single']);
      }
    });

    test('Should distinguish valid from invalid tuples with same validators', () => {
      const tupleValidationRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
        composeValidator([[isBoolean]]),
      ]);

      const validResult = tupleValidationRule(['valid', 123, true] as const);
      const invalidResult = tupleValidationRule(['valid', 'not number', true] as const);

      expect(validResult.status).toBe('success');
      expect(invalidResult.status).toBe('error');
    });

    test('Should have correct success structure with nested object validation inside tuple', () => {
      const workplaceSchema = {
        position: composeValidator([[isString, isOnlyEnglishLettersString]]),
        company: composeValidator([[isString, isOnlyEnglishLettersString]]),
      };
      const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
      const workplaceValidator = composeValidator([[isObject, workplaceValidationRule]]);
      const tupleValidationRule = createTupleValidationRule([workplaceValidator]);
      const tupleValidator = composeValidator([[isArray, tupleValidationRule], [isUndefined]]);
      const inputValue = [{ position: 'Manager', company: 'TechCorp' }] as const;

      const actualResult = tupleValidator(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult?.data?.[0]).toEqual({ position: 'Manager', company: 'TechCorp' });
      }
    });

    test('Should pass correct path to element validators without initial path', () => {
      // Arrange
      const capturedPaths: Array<string | undefined> = [];
      const createCapturingValidator = (): TValidator =>
        ((value: any, params?: TValidationParams) => {
          capturedPaths.push(params?.path);
          return new SuccessResult(value);
        }) as TValidator;

      const tupleRule = createTupleValidationRule([
        createCapturingValidator(),
        createCapturingValidator(),
        createCapturingValidator(),
      ]);

      // Act
      tupleRule(['Hello', 42, true] as const);

      // Assert
      expect(capturedPaths).toEqual(['[0]', '[1]', '[2]']);
    });

    test('Should prepend parent path to element paths for nested tuple', () => {
      // Arrange
      const capturedPaths: Array<string | undefined> = [];
      const createCapturingValidator = (): TValidator =>
        ((value: any, params?: TValidationParams) => {
          capturedPaths.push(params?.path);
          return new SuccessResult(value);
        }) as TValidator;

      const tupleRule = createTupleValidationRule([
        createCapturingValidator(),
        createCapturingValidator(),
      ]);

      // Act
      tupleRule([40.7128, -74.006] as const, { path: 'location.coordinates' });

      // Assert
      expect(capturedPaths).toEqual([
        'location.coordinates[0]',
        'location.coordinates[1]',
      ]);
    });
  });
});

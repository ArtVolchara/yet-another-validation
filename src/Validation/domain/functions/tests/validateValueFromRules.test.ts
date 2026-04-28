import { describe, test, expect } from 'vitest';
import validateValueFromRules, { DEFAULT_AND_SEPARATOR } from '../validateValueFromRules';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyLatinLettersString, { IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyLatinLettersString';
import decorateWithCustomError from '../../utils/decorateWithCustomError';
import { ErrorResult } from '../../../../_Root/domain/factories';

describe('validateValueFromRules', () => {
  describe('validateValueFromRules error cases', () => {
    test('should fail with single string rule for non-string input', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = IS_STRING_ERROR_MESSAGE;

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]?.message).toBe(expectedMessage);
      }
    });

    test('should return errors from all rules in chain when value is invalid', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString, isOnlyLatinLettersString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[1]?.message).toBe(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE);
      }
    });

    test('should use custom separator for error messages', () => {
      // Arrange
      const inputValue = 123;
      const customSeparator = ' | ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparator}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(
        inputValue,
        [isString, isOnlyLatinLettersString],
        { separator: customSeparator },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
      }
    });

    test('should use custom separator with rules provided as tuple variable', () => {
      // Arrange
      const inputValue = null;
      const customSeparator = ' -> ';
      const rules = [isString, isOnlyLatinLettersString] as const;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparator}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(inputValue, rules, { separator: customSeparator });

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
      }
    });

    test('should return custom error when decorated rule fails', () => {
      // Arrange
      const inputValue = 123;
      const customError = new ErrorResult('Custom string validation error', undefined);
      const decoratedValidationRule = decorateWithCustomError(isString, customError);

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedValidationRule]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe('Custom string validation error');
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]?.message).toBe('Custom string validation error');
      }
    });

    test('should return custom error for decorated first rule and default for second when both fail', () => {
      // Arrange
      const inputValue = 123;
      const customStringError = new ErrorResult('Custom: not a string', undefined);
      const decoratedIsString = decorateWithCustomError(isString, customStringError);
      const expectedMessage = `Custom: not a string${DEFAULT_AND_SEPARATOR}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedIsString, isOnlyLatinLettersString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]?.message).toBe('Custom: not a string');
        expect(actualResult.errors[1]?.message).toBe(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE);
      }
    });

    test('should use custom separator with decorated rules in chain', () => {
      // Arrange
      const inputValue = 123;
      const customSeparator = ' --- ';
      const customStringError = new ErrorResult('Custom: not a string', undefined);
      const decoratedIsString = decorateWithCustomError(isString, customStringError);
      const expectedMessage = `Custom: not a string${customSeparator}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(
        inputValue,
        [decoratedIsString, isOnlyLatinLettersString],
        { separator: customSeparator },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
      }
    });

    test('should return error when shouldReturnError is true even for valid value with single rule', () => {
      // Arrange
      const inputValue = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString], { shouldReturnError: true });

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
      }
    });

    test('should return errors from all rules when shouldReturnError is true even for valid value with multiple rules', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(
        inputValue,
        [isString, isOnlyLatinLettersString],
        { shouldReturnError: true },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[1]?.message).toBe(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE);
      }
    });

    test('should return error when shouldReturnError is true with decorated rule and valid value', () => {
      // Arrange
      const inputValue = 'Hello';
      const customError = new ErrorResult('Custom string error', undefined);
      const decoratedIsString = decorateWithCustomError(isString, customError);

      // Act
      const actualResult = validateValueFromRules(
        inputValue,
        [decoratedIsString],
        { shouldReturnError: true },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe('Custom string error');
        expect(actualResult.errors).toHaveLength(1);
      }
    });
  });

  describe('validateValueFromRules success cases', () => {
    test('should successfully validate with single string rule', () => {
      // Arrange
      const inputValue = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });

    test('should work with rules provided as tuple variable using as const', () => {
      // Arrange
      const inputValue = 'Hello';
      const rules = [isString, isOnlyLatinLettersString] as const;

      // Act
      const actualResult = validateValueFromRules(inputValue, rules);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });

    test('should work with inline tuple of rules', () => {
      // Arrange
      const inputValue = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString, isOnlyLatinLettersString]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });

    test('should return success when decorated rule passes', () => {
      // Arrange
      const inputValue = 'Hello';
      const customError = new ErrorResult('Custom string validation error', undefined);
      const decoratedValidator = decorateWithCustomError(isString, customError);

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedValidator]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import validateValueFromRules, { DEFAULT_AND_SEPARATOR } from '../validateValueFromRules';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyEnglishLettersString, { IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyEnglishLettersString';
import customErrorDecorator from '../../utils/customErrorDecorator';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('validateValueFromRules', () => {
  describe('Single validation rule in chain', () => {
    it('should successfully validate with single string rule', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should fail with single string rule for non-string input', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = IS_STRING_ERROR_MESSAGE;
      const expectedErrorCount = 1;

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(expectedErrorCount);
        expect(actualResult.data[0]?.message).toBe(expectedMessage);
      }
    });
  });

  describe('Multiple validation rule in chain', () => {
    it('should handle multiple validation errors in chain', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE}`;
      const expectedErrorCount = 2;

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString, isOnlyEnglishLettersString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(expectedErrorCount);
        expect(actualResult.data[0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.data[1]?.message).toBe(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE);
      }
    });
  });

  describe('Providing rules chain as variable in a different ways', () => {
    it('should work with tuple variables using as const', () => {
    // Arrange
      const inputValue = 'Hello';
      const rules = [isString, isOnlyEnglishLettersString] as const;
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, rules);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should work with inline tuples', () => {
    // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString, isOnlyEnglishLettersString]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });
  });

  describe('With custom separator', () => {
    it('should use custom separator for error messages', () => {
      // Arrange
      const inputValue = 123;
      const customSeparator = ' | ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparator}${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        { separator: customSeparator },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
      }
    });

    it('should use custom separator with multiple rules', () => {
      // Arrange
      const inputValue = null;
      const customSeparator = ' -> ';
      const rules = [isString, isOnlyEnglishLettersString] as const;

      // Act
      const actualResult = validateValueFromRules(inputValue, rules, { separator: customSeparator });

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(customSeparator);
        expect(actualResult.message).toBe(`${IS_STRING_ERROR_MESSAGE}${customSeparator}${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE}`);
      }
    });

    it('should use custom separator with decorated rules', () => {
      // Arrange
      const inputValue = 123;
      const customSeparator = ' --- ';
      const customStringError = new ErrorResult('Custom: not a string', undefined);
      const decoratedString = customErrorDecorator(isString, customStringError);
      const expectedMessage = `Custom: not a string${customSeparator}${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(
        inputValue,
        [decoratedString, isOnlyEnglishLettersString],
        { separator: customSeparator },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
      }
    });
  });

  describe('With ruleCustomErrorDecorator', () => {
    it('should return custom error when using decorated rule', () => {
      // Arrange
      const inputValue = 123;
      const customError = new ErrorResult('Custom string validation error', undefined);
      const decoratedValidator = customErrorDecorator(isString, customError);

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedValidator]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe('Custom string validation error');
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]?.message).toBe('Custom string validation error');
      }
    });

    it('should return success when decorated rule passes', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';
      const customError = new ErrorResult('Custom string validation error', undefined);
      const decoratedValidator = customErrorDecorator(isString, customError);

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedValidator]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should work with multiple decorated validators in chain', () => {
      // Arrange
      const inputValue = 'Hello123';
      const customStringError = new ErrorResult('Custom: value is not string', undefined);
      const customLettersError = new ErrorResult('Custom: not only English letters', undefined);
      const decoratedString = customErrorDecorator(isString, customStringError);
      const decoratedLetters = customErrorDecorator(isOnlyEnglishLettersString, customLettersError);

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedString, decoratedLetters]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Custom: not only English letters');
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]?.message).toBe('Custom: not only English letters');
      }
    });

    it('should combine decorated and non-decorated rules in chain', () => {
      // Arrange
      const inputValue = 'Hello123';
      const customLettersError = new ErrorResult('Custom: not only English letters', undefined);
      const decoratedLetters = customErrorDecorator(isOnlyEnglishLettersString, customLettersError);

      // Act
      const actualResult = validateValueFromRules(inputValue, [isString, decoratedLetters]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Custom: not only English letters');
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]?.message).toBe('Custom: not only English letters');
      }
    });

    it('should return custom error as first in chain when decorated rule fails', () => {
      // Arrange
      const inputValue = 123;
      const customStringError = new ErrorResult('Custom: not a string', undefined);
      const decoratedString = customErrorDecorator(isString, customStringError);
      const expectedMessage = `Custom: not a string${DEFAULT_AND_SEPARATOR}${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValueFromRules(inputValue, [decoratedString, isOnlyEnglishLettersString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
        expect(actualResult.data[0]?.message).toBe('Custom: not a string');
        expect(actualResult.data[1]?.message).toBe(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE);
      }
    });

    it('should work with decorated rules provided as tuple variable', () => {
      // Arrange
      const inputValue = 123;
      const customStringError = new ErrorResult('Custom: not a string', undefined);
      const decoratedString = customErrorDecorator(isString, customStringError);
      const rules = [decoratedString, isOnlyEnglishLettersString] as const;

      // Act
      const actualResult = validateValueFromRules(inputValue, rules);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Custom: not a string');
        expect((actualResult.data as any)[0]?.message).toBe('Custom: not a string');
      }
    });
  });
});

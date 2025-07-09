import { describe, it, expect } from 'vitest';
import validateValueFromRules from '../validateValueFromRules';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyEnglishLettersString, { IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyEnglishLettersString';

describe('validateValueFromRules', () => {
  describe('Single validation rule in chain', () => {
    it('should successfully validate with single string rule', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValueFromRules(inputValue, isString);

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
      const actualResult = validateValueFromRules(inputValue, isString);

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
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE}`;
      const expectedErrorCount = 2;

      // Act
      const actualResult = validateValueFromRules(inputValue, isString, isOnlyEnglishLettersString);

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
      const actualResult = validateValueFromRules(inputValue, ...rules);

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
      const actualResult = validateValueFromRules(inputValue, isString, isOnlyEnglishLettersString);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });
  });
});

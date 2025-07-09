import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyEnglishLettersString, { IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyEnglishLettersString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray from '../../rules/isArray';
import isArrayMinLength from '../../rules/isArrayMinLength';
import isUndefined from '../../rules/isUndefined';
import isBoolean from '../../rules/isBoolean';
import validateValue from '../validateValue';

describe('validateValue', () => {
  describe('Single OR validator', () => {
    it('should successfully validate with single string rule', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValue(inputValue, [isString]);

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

      // Act
      const actualResult = validateValue(inputValue, [isString]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]).toHaveLength(1);
        expect(actualResult.data[0][0]?.message).toBe(expectedMessage);
      }
    });
  });

  describe('Multiple OR validators', () => {
    it('should return success when first validator passes', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValue(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should return success when second validator passes', () => {
      // Arrange
      const inputValue = 42;
      const expectedData = 42;

      // Act
      const actualResult = validateValue(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should return error when all validators fail', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE} OR ${IS_NUMBER_ERROR_MESSAGE}. ${IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
        expect(actualResult.data[0]).toHaveLength(2); // First AND group
        expect(actualResult.data[1]).toHaveLength(2); // Second AND group
      }
    });
  });

  describe('Mixed validator types', () => {
    it('should work with array validators and function validators', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';

      // Act
      const actualResult = validateValue(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        (value: any) => {
          if (typeof value === 'string') {
            return { status: 'success' as const, data: value };
          }
          return { status: 'error' as const, message: 'Custom error', data: [[{ status: 'error' as const, message: 'Custom error', data: undefined }]] };
        }
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should handle function validator errors correctly', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE} OR Custom error`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        (value: any) => {
          if (typeof value === 'string') {
            return { status: 'success' as const, data: value };
          }
          return { status: 'error' as const, message: 'Custom error', data: [[{ status: 'error' as const, message: 'Custom error', data: undefined }]] };
        }
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
      }
    });
  });

  describe('Complex validation scenarios', () => {
    it('should validate array with multiple conditions', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const expectedData = ['a', 'b', 'c'];

      // Act
      const actualResult = validateValue(
        inputValue,
        [isArray, isArrayMinLength(2)],
        [isString, isOnlyEnglishLettersString]
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should handle undefined value correctly', () => {
      // Arrange
      const inputValue = undefined;
      const expectedData = undefined;

      // Act
      const actualResult = validateValue(
        inputValue,
        [isUndefined],
        [isString, isOnlyEnglishLettersString]
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should handle boolean value correctly', () => {
      // Arrange
      const inputValue = true;
      const expectedData = true;

      // Act
      const actualResult = validateValue(
        inputValue,
        [isBoolean],
        [isString, isOnlyEnglishLettersString]
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });
  });

  describe('Error message formatting', () => {
    it('should format AND errors with dots and OR errors with OR', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE} OR ${IS_NUMBER_ERROR_MESSAGE}. ${IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        // Verify structure: "Error1. Error2 OR Error3. Error4"
        expect(actualResult.message).toContain('. ');
        expect(actualResult.message).toContain(' OR ');
      }
    });
  });
}); 
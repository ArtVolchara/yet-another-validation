import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyEnglishLettersString, { IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyEnglishLettersString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import isArrayMinLength from '../../rules/isArrayMinLength';
import isUndefined, { IS_UNDEFINED_ERROR_MESSAGE } from '../../rules/isUndefined';
import isBoolean, { IS_BOOLEAN_ERROR_MESSAGE } from '../../rules/isBoolean';
import composeValidator from '../composeValidator';

describe('composeValidator', () => {
  describe('Single OR validator', () => {
    it('should return success with single string rule', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';
      const validator = composeValidator([isString]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should return error with single string rule for non-string input', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = IS_STRING_ERROR_MESSAGE;
      const validator = composeValidator([isString]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]).toHaveLength(1);
        expect(actualResult.data[0][0]?.message).toBe(expectedMessage);
      }
    });

    it('should return success with single validator', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const expectedData = ['a', 'b', 'c'];
      const validator = composeValidator([isArray, isArrayMinLength(2)]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should return error when single validator fails', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_ARRAY_ERROR_MESSAGE}. Array should contain more than 2 elements`;
      const validator = composeValidator([isArray, isArrayMinLength(2)]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]).toHaveLength(2);

        // Проверяем конкретные сообщения об ошибках
        expect(actualResult.data[0][0]?.message).toBe(IS_ARRAY_ERROR_MESSAGE);
        expect(actualResult.data[0][1]?.message).toBe('Array should contain more than 2 elements');
      }
    });

    it('should return success with undefined value', () => {
      // Arrange
      const inputValue = undefined;
      const expectedData = undefined;
      const validator = composeValidator([isUndefined]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should return error with undefined value for non-undefined input', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = IS_UNDEFINED_ERROR_MESSAGE;
      const validator = composeValidator([isUndefined]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]).toHaveLength(1);
        expect(actualResult.data[0][0]?.message).toBe(expectedMessage);
      }
    });

    it('should return success with boolean value', () => {
      // Arrange
      const inputValue = true;
      const expectedData = true;
      const validator = composeValidator([isBoolean]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should return error with boolean value for non-boolean input', () => {
      // Arrange
      const inputValue = 'not a boolean';
      const expectedMessage = IS_BOOLEAN_ERROR_MESSAGE;
      const validator = composeValidator([isBoolean]);

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber],
      );

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber],
      );

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber],
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
        expect(actualResult.data[0]).toHaveLength(2); // First AND group
        expect(actualResult.data[1]).toHaveLength(2); // Second AND group
      }
  });

    it('should return success with validation rules and validator', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        composeValidator([isNumber, isPositiveNumber]),
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
    });

    it('should return error when both validator and validation rules fail', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE} OR ${IS_NUMBER_ERROR_MESSAGE}. ${IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE}`;
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        composeValidator([isNumber, isPositiveNumber]),
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
        expect(actualResult.data[0]).toHaveLength(2);
        expect(actualResult.data[1]).toHaveLength(2);

        // Проверяем конкретные сообщения об ошибках
        expect(actualResult.data[0][0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.data[0][1]?.message).toBe(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE);
        expect(actualResult.data[1][0]?.message).toBe(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult.data[1][1]?.message).toBe(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
      }
    });

    it('should return success with deeply nested validators', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const expectedData = ['a', 'b', 'c'];
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        composeValidator(
          [isString, isOnlyEnglishLettersString],
          composeValidator([isArray, isArrayMinLength(2)]),
        ),
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should return error when deeply nested validators fail', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE} OR ${IS_NUMBER_ERROR_MESSAGE}. ${IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE} OR ${IS_ARRAY_ERROR_MESSAGE}. Array should contain more than 2 elements`;
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        composeValidator(
          [isNumber, isPositiveNumber],
          composeValidator([isArray, isArrayMinLength(2)]),
        ),
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult.data[0]).toHaveLength(2); // First array
        expect(actualResult.data[1]).toHaveLength(2);
        expect(actualResult.data[2]).toHaveLength(2);

        // Проверяем конкретные сообщения об ошибках
        expect(actualResult.data[0][0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.data[0][1]?.message).toBe(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE);
        expect(actualResult.data[1][0]?.message).toBe(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult.data[1][1]?.message).toBe(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
      }
    });

    it('should return success with validation rules and custom validator', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        (value: any) => {
          if (typeof value === 'string') {
            return { status: 'success' as const, data: value };
          }
          return { status: 'error' as const, message: 'Custom error', data: [[{ status: 'error' as const, message: 'Custom error', data: undefined }]] };
        },
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(expectedData);
      }
  });

    it('should handle custom validator errors correctly', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}. ${IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE} OR Custom error`;
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        (value: any) => {
          if (typeof value === 'string') {
            return { status: 'success' as const, data: value };
          }
          return { status: 'error' as const, message: 'Custom error', data: [[{ status: 'error' as const, message: 'Custom error', data: undefined }]] };
        },
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.data).toHaveLength(2);
      }
    });
  });



});

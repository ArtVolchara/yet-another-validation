import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyEnglishLettersString, { IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyEnglishLettersString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray from '../../rules/isArray';
import isArrayMinLength from '../../rules/isArrayMinLength';
import isUndefined from '../../rules/isUndefined';
import isBoolean from '../../rules/isBoolean';
import composeValidator from '../composeValidator';

describe('composeValidator', () => {
  describe('Single OR validator', () => {
    it('should successfully validate with single string rule', () => {
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

    it('should fail with single string rule for non-string input', () => {
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
  });

  describe('Multiple OR validators', () => {
    it('should return success when first validator passes', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedData = 'Hello';
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
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
        [isNumber, isPositiveNumber]
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
        [isNumber, isPositiveNumber]
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
  });

  describe('Mixed validator types', () => {
    it('should work with array validators and function validators', () => {
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
        }
      );

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        (value: any) => {
          if (typeof value === 'string') {
            return { status: 'success' as const, data: value };
          }
          return { status: 'error' as const, message: 'Custom error', data: [[{ status: 'error' as const, message: 'Custom error', data: undefined }]] };
        }
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

  describe('Complex validation scenarios', () => {
    it('should validate array with multiple conditions', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const expectedData = ['a', 'b', 'c'];
      const validator = composeValidator(
        [isArray, isArrayMinLength(2)],
        [isString, isOnlyEnglishLettersString]
      );

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isUndefined],
        [isString, isOnlyEnglishLettersString]
      );

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isBoolean],
        [isString, isOnlyEnglishLettersString]
      );

      // Act
      const actualResult = validator(inputValue);

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
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
      );

      // Act
      const actualResult = validator(inputValue);

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

  describe('Composed validator reusability', () => {
    it('should allow reusing the same composed validator with different values', () => {
      // Arrange
      const validator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber]
      );
      const stringValue = 'Hello';
      const numberValue = 42;
      const invalidValue = null;

      // Act
      const stringResult = validator(stringValue);
      const numberResult = validator(numberValue);
      const invalidResult = validator(invalidValue);

      // Assert
      expect(stringResult.status).toBe('success');
      if (stringResult.status === 'success') {
        expect(stringResult.data).toBe(stringValue);
      }

      expect(numberResult.status).toBe('success');
      if (numberResult.status === 'success') {
        expect(numberResult.data).toBe(numberValue);
      }

      expect(invalidResult.status).toBe('error');
    });

    it('should maintain type safety for different input types', () => {
      // Arrange
      const stringValidator = composeValidator([isString]);
      const numberValidator = composeValidator([isNumber]);
      const booleanValidator = composeValidator([isBoolean]);

      // Act & Assert
      const stringResult = stringValidator('test');
      const numberResult = numberValidator(123);
      const booleanResult = booleanValidator(true);

      expect(stringResult.status).toBe('success');
      expect(numberResult.status).toBe('success');
      expect(booleanResult.status).toBe('success');
    });
  });

  describe('Type safety tests', () => {
    it('should have correct OR logic type structure', () => {
      // Arrange
      const validator = composeValidator([isString], [isNumber]);

      // Act
      const result = validator(123);

      // Assert
      if (result.status === 'error') {
        // Проверяем, что data имеет правильную структуру OR логики
        const data = result.data;
        
        // Runtime проверка структуры
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(2);
        expect(Array.isArray(data[0])).toBe(true);
        expect(Array.isArray(data[1])).toBe(true);
        
        // Проверяем, что каждый элемент имеет правильную структуру ошибки
        data.forEach(group => {
          group.forEach(error => {
            expect(error).toHaveProperty('status', 'error');
            expect(error).toHaveProperty('message');
            expect(typeof error.message).toBe('string');
          });
        });
      }
    });

    it('should have correct single operand OR logic type structure', () => {
      // Arrange
      const validator = composeValidator([isString, isOnlyEnglishLettersString]);

      // Act
      const result = validator(123);

      // Assert
      if (result.status === 'error') {
        const data = result.data;
        
        // Runtime проверка
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(1);
        expect(Array.isArray(data[0])).toBe(true);
        
        // Проверяем структуру ошибок
        data[0].forEach(error => {
          expect(error).toHaveProperty('status', 'error');
          expect(error).toHaveProperty('message');
        });
      }
    });

    it('should have correct error message type', () => {
      // Arrange
      const validator = composeValidator([isString], [isNumber]);

      // Act
      const result = validator(true);

      // Assert
      if (result.status === 'error') {
        // Проверяем, что message имеет правильный тип
        const message = result.message;
        
        // Runtime проверка
        expect(typeof message).toBe('string');
        expect(message).toContain(' OR ');
      }
    });

    it('should have correct success data type', () => {
      // Arrange
      const validator = composeValidator([isString]);

      // Act
      const result = validator('test');

      // Assert
      if (result.status === 'success') {
        const data = result.data;
        
        // Runtime проверка
        expect(typeof data).toBe('string');
      }
    });

    it('should maintain type safety for complex validators', () => {
      // Arrange
      const complexValidator = composeValidator(
        [isString, isOnlyEnglishLettersString],
        [isNumber, isPositiveNumber],
        [isBoolean]
      );

      // Act
      const result = complexValidator(null);

      // Assert
      if (result.status === 'error') {
        const data = result.data;
        
        // Runtime проверка
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(3);
        data.forEach(group => {
          expect(Array.isArray(group)).toBe(true);
          group.forEach(error => {
            expect(error).toHaveProperty('status', 'error');
            expect(error).toHaveProperty('message');
          });
        });
      }
    });

    it('should have correct nested error structure types', () => {
      // Arrange
      const validator = composeValidator([isString]);

      // Act
      const result = validator(123);

      // Assert
      if (result.status === 'error') {
        const data = result.data;
        const firstGroup = data[0];
        const firstError = firstGroup[0];
        
        // Проверяем структуру вложенных ошибок
        expect(firstError).toHaveProperty('status', 'error');
        expect(firstError).toHaveProperty('message');
        expect(firstError).toHaveProperty('data');
        
        // Проверяем типы свойств
        expect(typeof firstError.status).toBe('string');
        expect(typeof firstError.message).toBe('string');
      }
    });

    it('should handle undefined with OR logic correctly', () => {
      // Arrange
      const validator = composeValidator([isUndefined], [isString]);

      // Act
      const result = validator(123);

      // Assert
      if (result.status === 'error') {
        const data = result.data;
        
        // Runtime проверка
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(2);
        data.forEach(group => {
          expect(Array.isArray(group)).toBe(true);
          group.forEach(error => {
            expect(error).toHaveProperty('status', 'error');
            expect(error).toHaveProperty('message');
          });
        });
      }
    });
  });
}); 
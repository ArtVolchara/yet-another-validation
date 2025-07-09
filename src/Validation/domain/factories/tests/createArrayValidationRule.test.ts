import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import isBoolean from '../../rules/isBoolean';
import isOnlyDigitsString from '../../rules/isOnlyDigitsString';
import createArrayValidationRule from '../createArrayValidationRule';
import composeValidator from '../composeValidator';

describe('createArrayValidationRule', () => {
  describe('String array validation', () => {
    it('should successfully validate array of strings', () => {
      // Arrange
      const inputValue = ['Hello', 'World', 'Test'];
      const expectedData = ['Hello', 'World', 'Test'];
      const arrayValidator = createArrayValidationRule(composeValidator([isString]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when array contains non-string elements', () => {
      // Arrange
      const inputValue = ['Hello', 123, 'World'];
      const arrayValidator = createArrayValidationRule(composeValidator([isString]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Array validation failed for the following elements:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult?.data?.[0]).toBeUndefined(); // First element is valid
        expect(actualResult?.data?.[1]).toBeDefined(); // Second element has error
        expect(actualResult?.data?.[2]).toBeUndefined(); // Third element is valid
      }
    });

    it('should fail when input is not an array', () => {
      // Arrange
      const inputValue = 'not an array';
      const arrayValidator = createArrayValidationRule(composeValidator([isString]));

      // Act
      const actualResult = arrayValidator(inputValue as any);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(IS_ARRAY_ERROR_MESSAGE);
      }
    });
  });

  describe('Number array validation', () => {
    it('should successfully validate array of positive numbers', () => {
      // Arrange
      const inputValue = [1, 42, 100];
      const expectedData = [1, 42, 100];
      const arrayValidator = createArrayValidationRule(composeValidator([isPositiveNumber]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when array contains non-positive numbers', () => {
      // Arrange
      const inputValue = [1, -5, 0, 42];
      const arrayValidator = createArrayValidationRule(composeValidator([isPositiveNumber]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Array validation failed for the following elements:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain('2:');
        expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
        expect(actualResult.data).toHaveLength(4);
        expect(actualResult?.data?.[0]).toBeUndefined(); // First element is valid
        expect(actualResult?.data?.[1]).toBeDefined(); // Second element has error
        expect(actualResult?.data?.[2]).toBeDefined(); // Third element has error
        expect(actualResult?.data?.[3]).toBeUndefined(); // Fourth element is valid
      }
    });
  });

  describe('Boolean array validation', () => {
    it('should successfully validate array of booleans', () => {
      // Arrange
      const inputValue = [true, false, true];
      const expectedData = [true, false, true];
      const arrayValidator = createArrayValidationRule(composeValidator([isBoolean]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when array contains non-boolean elements', () => {
      // Arrange
      const inputValue = [true, 'false', 1, false];
      const arrayValidator = createArrayValidationRule(composeValidator([isBoolean]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Array validation failed for the following elements:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain('2:');
        expect(actualResult.data).toHaveLength(4);
        expect(actualResult?.data?.[0]).toBeUndefined(); // First element is valid
        expect(actualResult?.data?.[1]).toBeDefined(); // Second element has error
        expect(actualResult?.data?.[2]).toBeDefined(); // Third element has error
        expect(actualResult?.data?.[3]).toBeUndefined(); // Fourth element is valid
      }
    });
  });

  describe('Empty array validation', () => {
    it('should successfully validate empty array', () => {
      // Arrange
      const inputValue: string[] = [];
      const expectedData: string[] = [];
      const arrayValidator = createArrayValidationRule(composeValidator([isString]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });
  });

  describe('Mixed validation scenarios', () => {
    it('should handle array with all invalid elements', () => {
      // Arrange
      const inputValue = [null, undefined, 'not a number'];
      const arrayValidator = createArrayValidationRule(composeValidator([isNumber]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Array validation failed for the following elements:');
        expect(actualResult.message).toContain('0:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain('2:');
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult?.data?.[0]).toBeDefined(); // All elements have errors
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
      }
    });

    it('should handle single element array', () => {
      // Arrange
      const inputValue = ['single'];
      const expectedData = ['single'];
      const arrayValidator = createArrayValidationRule(composeValidator([isString]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });
  });

  describe('Error message formatting', () => {
    it('should format error messages with element indices', () => {
      // Arrange
      const inputValue = ['valid', 123, 'valid', false];
      const arrayValidator = createArrayValidationRule(composeValidator([isString]));

      // Act
      const actualResult = arrayValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain('3:');
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain('\n');
      }
    });
  });

  describe('Type tests for array validation', () => {
    it('should have correct error structure for array validation with OR logic', () => {
      // Arrange
      const arrValidatorRule = createArrayValidationRule(composeValidator([isOnlyDigitsString]));
      const arrValidator = composeValidator([arrValidatorRule]);
      const inputValue = ['5', '2', 'f'];

      // Act
      const actualResult = arrValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        // Проверяем структуру ошибки: массив массивов ErrorResult
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toHaveLength(1); // Один операнд OR

        const firstOperand = actualResult.data[0];
        expect(Array.isArray(firstOperand)).toBe(true);
        expect(firstOperand).toHaveLength(1); // Один валидатор в операнде

        const firstValidator = firstOperand[0];
        expect(firstValidator.status).toBe('error');
        if (firstValidator.status === 'error') {
          expect(typeof firstValidator.message).toBe('string');
          expect(firstValidator.message).toContain('Array validation failed');

          // Проверяем структуру данных ошибки: массив результатов для каждого элемента
          expect(firstValidator.data).toBeDefined();
          expect(Array.isArray(firstValidator.data)).toBe(true);
          expect(firstValidator.data).toHaveLength(3); // 3 элемента в массиве

          // Первые два элемента валидны (undefined)
          expect(firstValidator.data![0]).toBeUndefined();
          expect(firstValidator.data![1]).toBeUndefined();

          // Третий элемент невалиден (ErrorResult)
          expect(firstValidator.data![2]).toBeDefined();
          if (firstValidator.data![2] && typeof firstValidator.data![2] === 'object' && 'status' in firstValidator.data![2]) {
            const thirdElementError = firstValidator.data![2] as any;
            expect(thirdElementError.status).toBe('error');
            if (thirdElementError.status === 'error') {
              expect(typeof thirdElementError.message).toBe('string');
              expect(thirdElementError.message).toContain('only digits');
            }
          }
        }
      }
    });

    it('should have correct success structure for array validation', () => {
      // Arrange
      const arrValidatorRule = createArrayValidationRule(composeValidator([isOnlyDigitsString]));
      const arrValidator = composeValidator([arrValidatorRule]);
      const inputValue = ['5', '2', '3'];

      // Act
      const actualResult = arrValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        // Проверяем структуру успешного результата
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toEqual(['5', '2', '3']);
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import isBoolean from '../../rules/isBoolean';
import isOnlyDigitsString from '../../rules/isOnlyDigitsString';
import isUndefined from '../../rules/isUndefined';
import createArrayValidationRule from '../createArrayValidationRule';
import composeValidator from '../composeValidator';

describe('createArrayValidationRule', () => {
  describe('String array', () => {
    describe('Success case: all strings', () => {
      it('should validate array of strings', () => {
        // Arrange
        const inputValue = ['Hello', 'World', 'Test'];
        const expectedData = ['Hello', 'World', 'Test'];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: non-string elements', () => {
      it('should fail when array contains non-string elements', () => {
        // Arrange
        const inputValue = ['Hello', 123, 'World'];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Array validation failed for the following elements:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
          expect(actualResult.data).toHaveLength(3);
          expect(actualResult?.data?.[0]).toBeUndefined();
          expect(actualResult?.data?.[1]).toBeDefined();
          expect(actualResult?.data?.[2]).toBeUndefined();
        }
      });
      it('should fail when input is not an array', () => {
        // Arrange
        const inputValue = 'not an array';
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString]));

        // Act
        const actualResult = arrayValidationRule(inputValue as any);

        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toBe(IS_ARRAY_ERROR_MESSAGE);
        }
      });
    });
  });

  describe('Number array', () => {
    describe('Success case: all positive numbers', () => {
      it('should validate array of positive numbers', () => {
        // Arrange
        const inputValue = [1, 42, 100];
        const expectedData = [1, 42, 100];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isPositiveNumber]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: non-positive numbers', () => {
      it('should fail when array contains non-positive numbers', () => {
        // Arrange
        const inputValue = [1, -5, 0, 42];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isPositiveNumber]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Array validation failed for the following elements:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain('2:');
          expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
          expect(actualResult.data).toHaveLength(4);
          expect(actualResult?.data?.[0]).toBeUndefined();
          expect(actualResult?.data?.[1]).toBeDefined();
          expect(actualResult?.data?.[2]).toBeDefined();
          expect(actualResult?.data?.[3]).toBeUndefined();
        }
      });
    });
  });

  describe('Boolean array', () => {
    describe('Success case: all booleans', () => {
      it('should validate array of booleans', () => {
        // Arrange
        const inputValue = [true, false, true];
        const expectedData = [true, false, true];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isBoolean]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: non-boolean elements', () => {
      it('should fail when array contains non-boolean elements', () => {
        // Arrange
        const inputValue = [true, 'false', 1, false];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isBoolean]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Array validation failed for the following elements:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain('2:');
          expect(actualResult.data).toHaveLength(4);
          expect(actualResult?.data?.[0]).toBeUndefined();
          expect(actualResult?.data?.[1]).toBeDefined();
          expect(actualResult?.data?.[2]).toBeDefined();
          expect(actualResult?.data?.[3]).toBeUndefined();
        }
      });
    });
  });

  describe('Optional element', () => {
    describe('Success case: string or undefined', () => {
      it('should validate array with string or undefined elements', () => {
        // Arrange
        const inputValue = ['a', undefined, 'b'];
        const expectedData = ['a', undefined, 'b'];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString], [isUndefined]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: not string or undefined', () => {
      it('should fail when array contains not string or undefined', () => {
        // Arrange
        const inputValue = ['a', 123, undefined];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString], [isUndefined]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Array validation failed for the following elements:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult?.data?.[1]).toBeDefined();
        }
      });
    });
  });

  describe('Empty array', () => {
    describe('Success case: empty array', () => {
      it('should successfully validate empty array', () => {
        // Arrange
        const inputValue: string[] = [];
        const expectedData: string[] = [];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
  });

  describe('Mixed validation', () => {
    describe('Error case: all elements invalid', () => {
      it('should handle array with all invalid elements', () => {
        // Arrange
        const inputValue = [null, undefined, 'not a number'];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isNumber]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Array validation failed for the following elements:');
          expect(actualResult.message).toContain('0:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain('2:');
          expect(actualResult.data).toHaveLength(3);
          expect(actualResult?.data?.[0]).toBeDefined();
          expect(actualResult?.data?.[1]).toBeDefined();
          expect(actualResult?.data?.[2]).toBeDefined();
        }
      });
    });
    describe('Success case: single element array', () => {
      it('should handle single element array', () => {
        // Arrange
        const inputValue = ['single'];
        const expectedData = ['single'];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
  });

  describe('Edge cases', () => {
    describe('Error case: error message formatting', () => {
      it('should format error messages with element indices', () => {
        // Arrange
        const inputValue = ['valid', 123, 'valid', false];
        const arrayValidationRule = createArrayValidationRule(composeValidator([isString]));

        // Act
        const actualResult = arrayValidationRule(inputValue);

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
    describe('Type case: OR logic and structure', () => {
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
          expect(Array.isArray(actualResult.data)).toBe(true);
          expect(actualResult.data).toHaveLength(1);
          const firstOperand = actualResult.data[0];
          expect(Array.isArray(firstOperand)).toBe(true);
          expect(firstOperand).toHaveLength(1);
          const firstValidator = firstOperand[0];
          expect(firstValidator.status).toBe('error');
          if (firstValidator.status === 'error') {
            expect(typeof firstValidator.message).toBe('string');
            expect(firstValidator.message).toContain('Array validation failed');
            expect(firstValidator.data).toBeDefined();
            expect(Array.isArray(firstValidator.data)).toBe(true);
            expect(firstValidator.data).toHaveLength(3);
            expect(firstValidator.data![0]).toBeUndefined();
            expect(firstValidator.data![1]).toBeUndefined();
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
          expect(Array.isArray(actualResult.data)).toBe(true);
          expect(actualResult.data).toEqual(['5', '2', '3']);
        }
      });
    });
  });
});

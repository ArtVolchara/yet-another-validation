import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import isOnlyEnglishLettersString from '../../rules/isOnlyEnglishLettersString';
import isUndefined from '../../rules/isUndefined';
import createTupleValidationRule from '../createTupleValidationRule';
import createObjectValidationRule from '../createObjectValidationRule';
import composeValidator from '../composeValidator';

describe('createTupleValidationRule', () => {
  describe('Simple tuple', () => {
    describe('Success case: string and number', () => {
      it('should validate tuple with string and number', () => {
        // Arrange
        const inputValue = ['Hello', 42] as const;
        const expectedData = ['Hello', 42];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isNumber]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: invalid element types', () => {
      it('should fail when tuple elements do not match validators', () => {
        // Arrange
        const inputValue = [123, 'not a number'] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isNumber]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
          expect(actualResult.message).toContain('0:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
          expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
          expect(actualResult?.data?.[0]).toBeDefined();
          expect(actualResult?.data?.[1]).toBeDefined();
        }
      });
      it('should fail when input is not an array', () => {
        // Arrange
        const inputValue = 'not an array';
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isNumber]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue as any);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toBe(IS_ARRAY_ERROR_MESSAGE);
        }
      });
    });
  });

  describe('Complex tuple', () => {
    describe('Success case: multiple types', () => {
      it('should validate tuple with multiple types', () => {
        // Arrange
        const inputValue = ['Alice', 30, true, [1, 2, 3]] as const;
        const expectedData = ['Alice', 30, true, [1, 2, 3]];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isPositiveNumber]),
          composeValidator([isBoolean]),
          composeValidator([isArray]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: some elements invalid', () => {
      it('should fail when some tuple elements are invalid', () => {
        // Arrange
        const inputValue = ['Bob', -5, 'not boolean', [1, 2, 3]] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isPositiveNumber]),
          composeValidator([isBoolean]),
          composeValidator([isArray]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain('2:');
          expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
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
      it('should validate tuple with string or undefined', () => {
        // Arrange
        const inputValue = ['a', undefined] as const;
        const expectedData = ['a', undefined];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString], [isUndefined]),
          composeValidator([isString], [isUndefined]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: not string or undefined', () => {
      it('should fail when tuple element is not string or undefined', () => {
        // Arrange
        const inputValue = ['a', 123] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString], [isUndefined]),
          composeValidator([isString], [isUndefined]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult?.data?.[1]).toBeDefined();
        }
      });
    });
  });

  describe('Single element tuple', () => {
    describe('Success case: single element', () => {
      it('should validate tuple with single element', () => {
        // Arrange
        const inputValue = ['Single'] as const;
        const expectedData = ['Single'];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: single element invalid', () => {
      it('should fail when single element is invalid', () => {
        // Arrange
        const inputValue = [123] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
          expect(actualResult.message).toContain('0:');
          expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
          expect(actualResult?.data?.[0]).toBeDefined();
        }
      });
    });
  });

  describe('Mixed validation', () => {
    describe('Error case: all elements invalid', () => {
      it('should handle tuple with all invalid elements', () => {
        // Arrange
        const inputValue = [null, 'not a number'] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isNumber]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
          expect(actualResult.message).toContain('0:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult?.data?.[0]).toBeDefined();
          expect(actualResult?.data?.[1]).toBeDefined();
        }
      });
    });
    describe('Error case: mixed valid and invalid elements', () => {
      it('should handle tuple with mixed valid and invalid elements', () => {
        // Arrange
        const inputValue = ['valid', 'not number', true] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isNumber]),
          composeValidator([isBoolean]),
        ]);
        // Act
        const validResult = tupleValidationRule(['valid', 123, true] as const);
        const invalidResult = tupleValidationRule(inputValue);
        // Assert
        expect(validResult.status).toBe('success');
        expect(invalidResult.status).toBe('error');
      });
    });
  });

  describe('Edge cases', () => {
    describe('Error case: error message formatting', () => {
      it('should format error messages with element indices', () => {
        // Arrange
        const inputValue = [123, 'invalid', false] as const;
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([isString]),
          composeValidator([isNumber]),
          composeValidator([isBoolean]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('0:');
          expect(actualResult.message).toContain('1:');
          expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
          expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
          expect(actualResult.message).toContain(' ');
        }
      });
    });
    describe('Type case: OR logic and structure', () => {
      it('should have correct error structure for tuple validation with OR logic', () => {
        // Arrange
        const workplaceSchema = {
          position: composeValidator([isString, isOnlyEnglishLettersString]),
          company: composeValidator([isString, isOnlyEnglishLettersString]),
        };
        const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
        const workplaceValidator = composeValidator([workplaceValidationRule]);
        const tupleValidationRuleRule = createTupleValidationRule([workplaceValidator]);
        const tupleValidationRule = composeValidator([tupleValidationRuleRule], [isUndefined]);
        const inputValue = [{ position: '1', company: 'w' }];
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(Array.isArray(actualResult.data)).toBe(true);
          expect(actualResult.data).toHaveLength(2);
          const firstOperand = actualResult.data[0];
          expect(Array.isArray(firstOperand)).toBe(true);
          expect(firstOperand).toHaveLength(1);
          const firstValidator = firstOperand[0];
          expect(firstValidator.status).toBe('error');
          if (firstValidator.status === 'error') {
            expect(typeof firstValidator.message).toBe('string');
            expect(firstValidator.message).toContain('Tuple validation failed');
            expect(Array.isArray(firstValidator.data)).toBe(true);
            expect(firstValidator.data).toHaveLength(1);
            expect(firstValidator.data![0]).toBeDefined();
            if (firstValidator.data![0] && typeof firstValidator.data![0] === 'object' && 'status' in firstValidator.data![0]) {
              const tupleElementError = firstValidator.data![0] as any;
              expect(tupleElementError.status).toBe('error');
              if (tupleElementError.status === 'error') {
                expect(typeof tupleElementError.message).toBe('string');
                expect(tupleElementError.message).toContain('Object validation failed');
                expect(Array.isArray(tupleElementError.data)).toBe(true);
                expect(tupleElementError.data).toHaveLength(1);
                const objectOperand = tupleElementError.data[0];
                expect(Array.isArray(objectOperand)).toBe(true);
                expect(objectOperand).toHaveLength(1);
                const objectValidator = objectOperand[0];
                expect(objectValidator.status).toBe('error');
                if (objectValidator.status === 'error') {
                  expect(typeof objectValidator.message).toBe('string');
                  expect(objectValidator.message).toContain('Object validation failed');
                  expect(typeof objectValidator.data).toBe('object');
                  expect(objectValidator.data).not.toBeNull();
                  const objectData = objectValidator.data as any;
                  expect(objectData.position).toBeDefined();
                  if (objectData.position && typeof objectData.position === 'object' && 'status' in objectData.position) {
                    const positionError = objectData.position as any;
                    expect(positionError.status).toBe('error');
                    if (positionError.status === 'error') {
                      expect(typeof positionError.message).toBe('string');
                      expect(positionError.message).toContain('only English letters');
                    }
                  }
                  if (objectData.company && typeof objectData.company === 'object' && 'status' in objectData.company) {
                    const companyError = objectData.company as any;
                    expect(companyError.status).toBe('error');
                    if (companyError.status === 'error') {
                      expect(typeof companyError.message).toBe('string');
                      expect(companyError.message).toContain('only English letters');
                    }
                  }
                }
              }
            }
          }
          const secondOperand = actualResult.data[1];
          expect(Array.isArray(secondOperand)).toBe(true);
          expect(secondOperand).toHaveLength(1);
          const secondValidator = secondOperand[0];
          expect(secondValidator.status).toBe('error');
          if (secondValidator.status === 'error') {
            expect(typeof secondValidator.message).toBe('string');
            expect(secondValidator.message).toContain('undefined');
          }
        }
      });
      it('should have correct success structure for tuple validation', () => {
        // Arrange
        const workplaceSchema = {
          position: composeValidator([isString, isOnlyEnglishLettersString]),
          company: composeValidator([isString, isOnlyEnglishLettersString]),
        };
        const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
        const workplaceValidator = composeValidator([workplaceValidationRule]);
        const tupleValidationRuleRule = createTupleValidationRule([workplaceValidator]);
        const tupleValidationRule = composeValidator([tupleValidationRuleRule]);
        const inputValue = [{ position: 'Manager', company: 'TechCorp' }] as const;
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(Array.isArray(actualResult.data)).toBe(true);
          expect(actualResult.data).toHaveLength(1);
          expect(actualResult.data[0]).toEqual({ position: 'Manager', company: 'TechCorp' });
        }
      });
    });
  });
});

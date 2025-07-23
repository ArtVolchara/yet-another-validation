import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import { IS_OBJECT_ERROR_MESSAGE } from '../../rules/isObject';
import createObjectValidationRule from '../createObjectValidationRule';
import composeValidator from '../composeValidator';
import isUndefined from '../../rules/isUndefined';

describe('createObjectValidationRule', () => {
  describe('Simple object', () => {
    describe('Success case: valid string and number fields', () => {
      it('should validate object with string and number fields', () => {
        // Arrange
        const inputValue = { name: 'John', age: 25 };
        const expectedData = { name: 'John', age: 25 };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
      it('should validate object with single string field', () => {
        // Arrange
        const inputValue = { name: 'Single' };
        const expectedData = { name: 'Single' };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: invalid field types', () => {
      it('should fail when object fields do not match validators', () => {
        // Arrange
        const inputValue = { name: 123, age: 'not a number' };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Object validation failed for the following fields:');
          expect(actualResult.message).toContain('name:');
          expect(actualResult.message).toContain('age:');
          expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
          expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
          expect(actualResult?.data?.name).toBeDefined();
          expect(actualResult?.data?.age).toBeDefined();
          expect(typeof actualResult.data).toBe('object');
          expect(actualResult.data).toHaveProperty('name');
          expect(actualResult.data).toHaveProperty('age');
        }
      });
      it('should fail when single field is invalid', () => {
        // Arrange
        const inputValue = { name: 123 };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Object validation failed for the following fields:');
          expect(actualResult.message).toContain('name:');
          expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
          expect(actualResult?.data?.name).toBeDefined();
        }
      });
    });
  });

  describe('Complex object', () => {
    describe('Success case: valid multiple field types', () => {
      it('should validate object with multiple field types', () => {
        // Arrange
        const inputValue = {
          name: 'Alice',
          age: 30,
          isActive: true,
          score: 95.5,
        };
        const expectedData = { ...inputValue };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isPositiveNumber]),
          isActive: composeValidator([isBoolean]),
          score: composeValidator([isNumber]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: some fields invalid', () => {
      it('should fail when some fields are invalid', () => {
        // Arrange
        const inputValue = {
          name: 'Bob',
          age: -5,
          isActive: 'true',
          score: 100,
        };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isPositiveNumber]),
          isActive: composeValidator([isBoolean]),
          score: composeValidator([isNumber]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Object validation failed for the following fields:');
          expect(actualResult.message).toContain('age:');
          expect(actualResult.message).toContain('isActive:');
          expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
          expect(actualResult?.data?.name).toBeUndefined();
          expect(actualResult?.data?.age).toBeDefined();
          expect(actualResult?.data?.isActive).toBeDefined();
          expect(actualResult?.data?.score).toBeUndefined();
        }
      });
      it('should handle object with all invalid fields', () => {
        // Arrange
        const inputValue = {
          name: 123,
          age: 'not a number',
          isActive: null,
        };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
          isActive: composeValidator([isBoolean]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Object validation failed for the following fields:');
          expect(actualResult.message).toContain('name:');
          expect(actualResult.message).toContain('age:');
          expect(actualResult.message).toContain('isActive:');
          expect(actualResult?.data?.name).toBeDefined();
          expect(actualResult?.data?.age).toBeDefined();
          expect(actualResult?.data?.isActive).toBeDefined();
        }
      });
    });
  });

  describe('Optional field', () => {
    describe('Success case: string or undefined', () => {
      it('should validate successfully when field is a string', () => {
        // Arrange
        const objectValidationRule = createObjectValidationRule({
          optionalField: composeValidator([isString], [isUndefined]),
        });
        const inputValue = { optionalField: 'test' };
        const expectedData = { optionalField: 'test' };
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
      it('should validate successfully when field is undefined', () => {
        // Arrange
        const objectValidationRule = createObjectValidationRule({
          optionalField: composeValidator([isString], [isUndefined]),
        });
        const inputValue = { optionalField: undefined };
        const expectedData = { optionalField: undefined };
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: not string or undefined', () => {
      it('should fail when field is not string or undefined', () => {
        // Arrange
        const objectValidationRule = createObjectValidationRule({
          optionalField: composeValidator([isString], [isUndefined]),
        });
        const inputValue = { optionalField: 123 };
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('optionalField:');
          expect(actualResult?.data?.optionalField).toBeDefined();
        }
      });
    });
  });

  describe('Edge cases', () => {
    describe('Success case: empty object', () => {
      it('should successfully validate empty object', () => {
        // Arrange
        const inputValue = {};
        const expectedData = {};
        const objectValidationRule = createObjectValidationRule({});
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
    describe('Error case: input is not an object', () => {
      it('should fail when input is not an object', () => {
        // Arrange
        const inputValue = 'not an object';
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue as any);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toBe(IS_OBJECT_ERROR_MESSAGE);
        }
      });
    });
    describe('Error case: undefined field in object', () => {
      it('should handle undefined fields correctly', () => {
        // Arrange
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
        });
        // Act
        const result = objectValidationRule({ name: 'John', age: undefined } as any);
        // Assert
        if (result.status === 'error') {
          const { data: errorData } = result;
          expect(errorData).toBeDefined();
          expect(typeof errorData).toBe('object');
          expect(errorData).not.toBeNull();
          expect(errorData?.age).toBeDefined();
          if (errorData?.age && typeof errorData?.age === 'object' && 'status' in errorData.age) {
            const ageError = errorData.age;
            expect(ageError.status).toBe('error');
            if (ageError.status === 'error') {
              expect(typeof ageError.message).toBe('string');
              expect(ageError.message).toContain('number');
            }
          }
        }
      });
    });
  });

  describe('Complex object', () => {
    describe('Error case: all fields invalid', () => {
      it('should handle object with all invalid fields', () => {
        // Arrange
        const inputValue = {
          name: 123,
          age: 'not a number',
          isActive: null,
        };
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
          isActive: composeValidator([isBoolean]),
        });
        // Act
        const actualResult = objectValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('error');
        if (actualResult.status === 'error') {
          expect(actualResult.message).toContain('Object validation failed for the following fields:');
          expect(actualResult.message).toContain('name:');
          expect(actualResult.message).toContain('age:');
          expect(actualResult.message).toContain('isActive:');
          expect(actualResult?.data?.name).toBeDefined();
          expect(actualResult?.data?.age).toBeDefined();
          expect(actualResult?.data?.isActive).toBeDefined();
        }
      });
    });
    describe('Error case: error structure and message', () => {
      it('should have correct object validation error structure', () => {
        // Arrange
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
        });
        // Act
        const result = objectValidationRule({ name: 123, age: 'invalid' });
        // Assert
        if (result.status === 'error') {
          const { data } = result;
          expect(typeof data).toBe('object');
          expect(data).toHaveProperty('name');
          expect(data).toHaveProperty('age');
          if (data?.name) {
            expect(data.name).toHaveProperty('status', 'error');
            expect(data.name).toHaveProperty('message');
            expect(typeof data.name.message).toBe('string');
          }
          if (data?.age) {
            expect(data.age).toHaveProperty('status', 'error');
            expect(data.age).toHaveProperty('message');
            expect(typeof data.age.message).toBe('string');
          }
        }
      });
      it('should have correct error message type', () => {
        // Arrange
        const objectValidationRule = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isNumber]),
        });
        // Act
        const result = objectValidationRule({ name: 123, age: 'invalid' });
        // Assert
        if (result.status === 'error') {
          const { message } = result;
          expect(typeof message).toBe('string');
          expect(message).toContain('Object validation failed for the following fields:');
          expect(message).toContain('name:');
          expect(message).toContain('age:');
        }
      });
      it('should maintain type safety for complex object schemas', () => {
        // Arrange
        const complexValidator = createObjectValidationRule({
          name: composeValidator([isString]),
          age: composeValidator([isPositiveNumber]),
          isActive: composeValidator([isBoolean]),
          score: composeValidator([isNumber]),
        });
        // Act
        const result = complexValidator({
          name: 'John123',
          age: -5,
          isActive: 'true',
          score: 95.5,
        });
        // Assert
        if (result.status === 'error') {
          const { data } = result;
          expect(data).toBeDefined();
          expect(typeof data).toBe('object');
          expect(data).not.toBeNull();
          const objectData = data as any;
          expect(objectData.age).toBeDefined();
          expect(objectData.isActive).toBeDefined();
          if (objectData.age && typeof objectData.age === 'object' && 'status' in objectData.age) {
            const ageError = objectData.age as any;
            expect(ageError.status).toBe('error');
            if (ageError.status === 'error') {
              expect(typeof ageError.message).toBe('string');
              expect(ageError.message).toContain('positive number');
            }
          }
          if (objectData.isActive && typeof objectData.isActive === 'object' && 'status' in objectData.isActive) {
            const isActiveError = objectData.isActive as any;
            expect(isActiveError.status).toBe('error');
            if (isActiveError.status === 'error') {
              expect(typeof isActiveError.message).toBe('string');
              expect(isActiveError.message).toContain('boolean');
            }
          }
        }
      });
    });
  });
});

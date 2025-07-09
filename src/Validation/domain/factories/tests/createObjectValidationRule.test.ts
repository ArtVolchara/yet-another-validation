import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import isOnlyEnglishLettersString from '../../rules/isOnlyEnglishLettersString';
import isObject, { IS_OBJECT_ERROR_MESSAGE } from '../../rules/isObject';
import createObjectValidationRule from '../createObjectValidationRule';
import composeValidator from '../composeValidator';

describe('createObjectValidationRule', () => {
  describe('Simple object validation', () => {
    it('should successfully validate object with string and number fields', () => {
      // Arrange
      const inputValue = { name: 'John', age: 25 };
      const expectedData = { name: 'John', age: 25 };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when object fields do not match validators', () => {
      // Arrange
      const inputValue = { name: 123, age: 'not a number' };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

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
      }
    });

    it('should fail when input is not an object', () => {
      // Arrange
      const inputValue = 'not an object';
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const actualResult = objectValidator(inputValue as any);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(IS_OBJECT_ERROR_MESSAGE);
      }
    });
  });

  describe('Complex object validation', () => {
    it('should successfully validate object with multiple field types', () => {
      // Arrange
      const inputValue = {
        name: 'Alice',
        age: 30,
        isActive: true,
        score: 95.5,
      };
      const expectedData = {
        name: 'Alice',
        age: 30,
        isActive: true,
        score: 95.5,
      };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isPositiveNumber]),
        isActive: composeValidator([isBoolean]),
        score: composeValidator([isNumber]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when some fields are invalid', () => {
      // Arrange
      const inputValue = {
        name: 'Bob',
        age: -5, // Invalid: negative number
        isActive: 'true', // Invalid: string instead of boolean
        score: 100, // Valid
      };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isPositiveNumber]),
        isActive: composeValidator([isBoolean]),
        score: composeValidator([isNumber]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Object validation failed for the following fields:');
        expect(actualResult.message).toContain('age:');
        expect(actualResult.message).toContain('isActive:');
        expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.name).toBeUndefined(); // Valid field
        expect(actualResult?.data?.age).toBeDefined(); // Invalid field
        expect(actualResult?.data?.isActive).toBeDefined(); // Invalid field
        expect(actualResult?.data?.score).toBeUndefined(); // Valid field
      }
    });
  });

  describe('Empty object validation', () => {
    it('should successfully validate empty object', () => {
      // Arrange
      const inputValue = {};
      const expectedData = {};
      const objectValidator = createObjectValidationRule({});

      // Act
      const actualResult = objectValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });
  });

  describe('Single field validation', () => {
    it('should successfully validate object with single field', () => {
      // Arrange
      const inputValue = { name: 'Single' };
      const expectedData = { name: 'Single' };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when single field is invalid', () => {
      // Arrange
      const inputValue = { name: 123 };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

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

  describe('Nested object scenarios', () => {
    it('should handle object with all invalid fields', () => {
      // Arrange
      const inputValue = {
        name: 123,
        age: 'not a number',
        isActive: null,
      };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
        isActive: composeValidator([isBoolean]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

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

  describe('Error message formatting', () => {
    it('should format error messages with field names', () => {
      // Arrange
      const inputValue = { name: 123, age: 'invalid' };
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const actualResult = objectValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('name:');
        expect(actualResult.message).toContain('age:');
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult.message).toContain('\n');
      }
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety for different field types', () => {
      // Arrange
      const stringValidator = createObjectValidationRule({ name: composeValidator([isString]) });
      const numberValidator = createObjectValidationRule({ value: composeValidator([isNumber]) });
      const booleanValidator = createObjectValidationRule({ flag: composeValidator([isBoolean]) });

      // Act & Assert
      const stringResult = stringValidator({ name: 'test' });
      const numberResult = numberValidator({ value: 123 });
      const booleanResult = booleanValidator({ flag: true });

      expect(stringResult.status).toBe('success');
      expect(numberResult.status).toBe('success');
      expect(booleanResult.status).toBe('success');
    });
  });

  describe('Type safety tests', () => {
    it('should have correct object validation error structure', () => {
      // Arrange
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const result = objectValidator({ name: 123, age: 'invalid' });

      // Assert
      if (result.status === 'error') {
        const { data } = result;

        // Runtime проверка структуры ошибок объекта
        expect(typeof data).toBe('object');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('age');

        // Проверяем, что ошибки имеют правильную структуру
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

    it('should have correct success data structure', () => {
      // Arrange
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const result = objectValidator({ name: 'John', age: 30 });

      // Assert
      if (result.status === 'success') {
        const { data } = result;

        // Runtime проверка структуры успешного результата
        expect(typeof data).toBe('object');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('age');
        expect(typeof data.name).toBe('string');
        expect(typeof data.age).toBe('number');
      }
    });

    it('should handle undefined fields correctly', () => {
      // Arrange
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const result = objectValidator({ name: 'John', age: undefined } as any); // age is undefined

      // Assert
      if (result.status === 'error') {
        const { data } = result;

        // Runtime проверка структуры ошибки: объект с полями ошибок
        expect(data).toBeDefined();
        expect(typeof data).toBe('object');
        expect(data).not.toBeNull();

        const objectData = data as any;
        expect(objectData.age).toBeDefined();

        // Проверяем ошибку для поля age
        if (objectData.age && typeof objectData.age === 'object' && 'status' in objectData.age) {
          const ageError = objectData.age as any;
          expect(ageError.status).toBe('error');
          if (ageError.status === 'error') {
            expect(typeof ageError.message).toBe('string');
            expect(ageError.message).toContain('number');
          }
        }
      }
    });

    it('should have correct error message type', () => {
      // Arrange
      const objectValidator = createObjectValidationRule({
        name: composeValidator([isString]),
        age: composeValidator([isNumber]),
      });

      // Act
      const result = objectValidator({ name: 123, age: 'invalid' });

      // Assert
      if (result.status === 'error') {
        const { message } = result;

        // Runtime проверка
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
        name: 'John123', // Valid
        age: -5, // Invalid: negative
        isActive: 'true', // Invalid: string
        score: 95.5, // Valid
      });

      // Assert
      if (result.status === 'error') {
        const { data } = result;

        // Runtime проверка структуры ошибки: объект с полями ошибок
        expect(data).toBeDefined();
        expect(typeof data).toBe('object');
        expect(data).not.toBeNull();

        const objectData = data as any;
        expect(objectData.age).toBeDefined();
        expect(objectData.isActive).toBeDefined();

        // Проверяем ошибки для полей объекта
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

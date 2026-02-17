import { describe, it, expect } from 'vitest';
import defaultValueDecorator from '../defaultValueDecorator';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isUndefined from '../../rules/isUndefined';
import composeValidator from '../../factories/composeValidator';
import createObjectValidationRule from '../../factories/createObjectValidationRule';
import createArrayValidationRule from '../../factories/createArrayValidationRule';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';


describe('defaultValueDecorator', () => {
  describe('With static default value', () => {
    it('should return default value on failed validation', () => {
      // Arrange
      const inputValue = 123;
      const defaultValue = 'fallback';
      const safeIsString = defaultValueDecorator(isString, defaultValue);

      // Act
      const actualResult = safeIsString(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe(defaultValue);
    });

    it('should return original result on successful validation', () => {
      // Arrange
      const inputValue = 'hello';
      const defaultValue = 'fallback';
      const safeIsString = defaultValueDecorator(isString, defaultValue);

      // Act
      const actualResult = safeIsString(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe('hello');
    });

    it('should work with numeric default value', () => {
      // Arrange
      const inputValue = 'not a number';
      const defaultValue = 0;
      const safeIsNumber = defaultValueDecorator(isNumber, defaultValue);

      // Act
      const actualResult = safeIsNumber(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe(0);
    });

    it('should work with undefined as default value', () => {
      // Arrange
      const inputValue = 123;
      const safeIsString = defaultValueDecorator(isString, undefined);

      // Act
      const actualResult = safeIsString(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBeUndefined();
    });
  });

  describe('With default value factory', () => {
    it('should call factory with error on failed validation', () => {
      // Arrange
      const inputValue = 123;
      const safeIsString = defaultValueDecorator(
        isString,
        (error) => `fallback: ${error.message}`,
      );

      // Act
      const actualResult = safeIsString(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe(`fallback: ${IS_STRING_ERROR_MESSAGE}`);
    });

    it('should not call factory on successful validation', () => {
      // Arrange
      const inputValue = 'hello';
      let isFactoryCalled = false;
      const safeIsString = defaultValueDecorator(
        isString,
        () => {
          isFactoryCalled = true;
          return 'fallback';
        },
      );

      // Act
      const actualResult = safeIsString(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe('hello');
      expect(isFactoryCalled).toBe(false);
    });

    it('should pass error data to factory', () => {
      // Arrange
      const inputValue = 'not a number';
      const safeIsNumber = defaultValueDecorator(
        isNumber,
        (error) => ({ originalMessage: error.message, originalData: error.data }),
      );

      // Act
      const actualResult = safeIsNumber(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toEqual({
        originalMessage: IS_NUMBER_ERROR_MESSAGE,
        originalData: undefined,
      });
    });
  });

  describe('Composition with composeValidator', () => {
    it('should work with composeValidator and static default value', () => {
      // Arrange
      const inputValue = 123;
      const validator = composeValidator([[isString], [isUndefined]]);
      const safeValidator = defaultValueDecorator(validator, 'default');

      // Act
      const actualResult = safeValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe('default');
    });

    it('should return original result on successful composeValidator validation', () => {
      // Arrange
      const inputValue = 'hello';
      const validator = composeValidator([[isString], [isUndefined]]);
      const safeValidator = defaultValueDecorator(validator, 'default');

      // Act
      const actualResult = safeValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toBe('hello');
    });
  });

  describe('Composition with createObjectValidationRule (field-level)', () => {
    it('should provide default for a specific object field', () => {
      // Arrange
      const inputValue = { a: 123, b: 42 };
      const objectRule = createObjectValidationRule({
        a: defaultValueDecorator(composeValidator([[isString]]), 'default-a'),
        b: composeValidator([[isNumber]]),
      });

      // Act
      const actualResult = objectRule(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data.a).toBe('default-a');
        expect(actualResult.data.b).toBe(42);
      }
    });

    it('should return original values when all fields pass validation', () => {
      // Arrange
      const inputValue = { a: 'hello', b: 42 };
      const objectRule = createObjectValidationRule({
        a: defaultValueDecorator(composeValidator([[isString]]), 'default-a'),
        b: composeValidator([[isNumber]]),
      });

      // Act
      const actualResult = objectRule(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data.a).toBe('hello');
        expect(actualResult.data.b).toBe(42);
      }
    });
  });

  describe('Composition with createArrayValidationRule', () => {
    it('should work as array element validator', () => {
      // Arrange
      const inputValue = [1, 'not a number', 3];
      const safeNumberValidator = defaultValueDecorator(composeValidator([[isNumber]]), 0);
      const arrayRule = createArrayValidationRule(safeNumberValidator);

      // Act
      const actualResult = arrayRule(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual([1, 0, 3]);
      }
    });
  });

  describe('Edge cases', () => {
    it('should return SuccessResult with correct structure', () => {
      // Arrange
      const inputValue = 123;
      const safeIsString = defaultValueDecorator(isString, 'fallback');

      // Act
      const actualResult = safeIsString(inputValue);

      // Assert
      expect(actualResult).toBeInstanceOf(SuccessResult);
      expect(actualResult).toEqual(new SuccessResult('fallback'));
    });

    it('should work with object as default value', () => {
      // Arrange
      const inputValue = 'not a number';
      const defaultObj = { value: 0, reason: 'invalid' } as const;
      const safeIsNumber = defaultValueDecorator(isNumber, defaultObj);

      // Act
      const actualResult = safeIsNumber(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toEqual(defaultObj);
    });

    it('should work with array as default value', () => {
      // Arrange
      const inputValue = 'not a number';
      const defaultArr = [1, 2, 3] as const;
      const safeIsNumber = defaultValueDecorator(isNumber, defaultArr);

      // Act
      const actualResult = safeIsNumber(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      expect(actualResult.data).toEqual([1, 2, 3]);
    });
  });
});

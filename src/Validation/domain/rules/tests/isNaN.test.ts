import { describe, test, expect } from "vitest";
import isNaN, { IS_NAN_ERROR_MESSAGE } from '../isNaN';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';
import customErrorDecorator from '../../utils/customErrorDecorator';

describe('isNaN validation rule test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 0, description: 'zero' },
      { input: 1, description: 'positive number' },
      { input: -1, description: 'negative number' },
      { input: '', description: 'empty string' },
      { input: 'abc', description: 'string' },
      { input: true, description: 'boolean true' },
      { input: false, description: 'boolean false' },
      { input: Symbol('foo'), description: 'Symbol value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const expectedResult = new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isNaN(input);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: NaN, description: 'NaN value' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isNaN(input);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('Non-primitive values', () => {
    const nonPrimitiveTestCases = [
      { input: {}, description: 'empty object' },
      { input: [], description: 'empty array' },
      { input: () => {}, description: 'function' },
      { input: new Date(), description: 'Date object' },
      { input: new Map(), description: 'Map' },
      { input: new Set(), description: 'Set' },
      { input: new WeakMap(), description: 'WeakMap' },
      { input: new WeakSet(), description: 'WeakSet' },
    ];

    nonPrimitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const expectedResult = new ErrorResult(IS_NAN_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isNaN(input);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('Custom error with ruleCustomErrorDecorator', () => {
    test('Should return custom error when validation fails', () => {
      // Arrange
      const inputValue = 123;
      const customError = new ErrorResult('Custom NaN error', undefined);
      const validator = customErrorDecorator(isNaN, customError);
      const expectedResult = customError;

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    test('Should return success when validation passes with custom error decorator', () => {
      // Arrange
      const inputValue = NaN;
      const customError = new ErrorResult('Custom NaN error', undefined);
      const validator = customErrorDecorator(isNaN, customError);
      const expectedResult = new SuccessResult(inputValue);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });
}); 
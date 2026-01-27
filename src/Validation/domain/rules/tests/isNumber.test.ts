import { describe, test, expect } from "vitest";
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../isNumber';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';
import ruleCustomErrorDecorator from '../../factories/ruleCustomErrorDecorator';

describe('isNumber validation rule test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 'hello', description: 'string value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
      { input: Number.NaN, description: 'NaN' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as number;
        const expectedResult = new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isNumber(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: 0, description: 'zero' },
      { input: 1, description: 'positive integer' },
      { input: -1, description: 'negative integer' },
      { input: 1.5, description: 'positive float' },
      { input: -1.5, description: 'negative float' },
      { input: Number.MAX_VALUE, description: 'max value' },
      { input: Number.MIN_VALUE, description: 'min value' },
      { input: Number.POSITIVE_INFINITY, description: 'positive infinity' },
      { input: Number.NEGATIVE_INFINITY, description: 'negative infinity' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isNumber(inputValue);

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
        const inputValue = input as unknown as number;
        const expectedResult = new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isNumber(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('Custom error with ruleCustomErrorDecorator', () => {
    test('Should return custom error when validation fails', () => {
      // Arrange
      const inputValue = 'not a number';
      const customError = new ErrorResult('Custom number error', undefined);
      const validator = ruleCustomErrorDecorator(isNumber, customError);
      const expectedResult = customError;

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    test('Should return success when validation passes with custom error decorator', () => {
      // Arrange
      const inputValue = 42;
      const customError = new ErrorResult('Custom number error', undefined);
      const validator = ruleCustomErrorDecorator(isNumber, customError);
      const expectedResult = new SuccessResult(42);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });
});

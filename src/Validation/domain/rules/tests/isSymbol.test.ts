import { describe, test, expect } from "vitest";
import isSymbol, { IS_SYMBOL_ERROR_MESSAGE } from '../isSymbol';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isSymbol validation rule test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 'hello', description: 'string value' },
      { input: 0, description: 'number value' },
      { input: false, description: 'boolean value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as symbol;
        const expectedResult = new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isSymbol(inputValue);

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
        const inputValue = input as unknown as symbol;
        const expectedResult = new ErrorResult(IS_SYMBOL_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isSymbol(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: Symbol(), description: 'empty Symbol' },
      { input: Symbol('description'), description: 'Symbol with description' },
      { input: Symbol.for('key'), description: 'Symbol.for' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isSymbol(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
}); 
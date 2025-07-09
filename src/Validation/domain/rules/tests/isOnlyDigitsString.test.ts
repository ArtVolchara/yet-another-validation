import { describe, test, expect } from "vitest";
import isOnlyDigitsString, { IS_ONLY_DIGITS_STRING_ERROR_MESSAGE } from '../isOnlyDigitsString';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isOnlyDigitsString validation rule test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: '', description: 'empty string' },
      { input: 'abc', description: 'string with letters' },
      { input: 'abc123', description: 'string with letters and digits' },
      { input: '123abc', description: 'string with digits and letters' },
      { input: 'abc def', description: 'string with space' },
      { input: 'abc!', description: 'string with special character' },
      { input: ' abc', description: 'string with leading space' },
      { input: 'abc ', description: 'string with trailing space' },
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 123, description: 'number value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as string;
        const expectedResult = new ErrorResult(IS_ONLY_DIGITS_STRING_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isOnlyDigitsString(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: '0', description: 'single digit' },
      { input: '123', description: 'multiple digits' },
      { input: '000', description: 'repeated digits' },
      { input: '1234567890', description: 'all digits' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isOnlyDigitsString(input);

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
        const inputValue = input as unknown as string;
        const expectedResult = new ErrorResult(IS_ONLY_DIGITS_STRING_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isOnlyDigitsString(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

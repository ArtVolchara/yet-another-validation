import { describe, test, expect } from "vitest";
import isOnlyLatinLettersString, { IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE } from '../isOnlyLatinLettersString';
import { SuccessResult, ErrorResult } from '../../../../_Root/domain/factories';

describe('isOnlyLatinLettersString validation rule test', () => {
  describe('isOnlyLatinLettersString error cases', () => {
    const errorTestCases = [
      { input: '', description: 'empty string' },
      { input: '123', description: 'string with digits' },
      { input: 'abc123', description: 'string with letters and digits' },
      { input: '123abc', description: 'string with digits and letters' },
      { input: 'abc def', description: 'string with space' },
      { input: 'abc!', description: 'string with special character' },
      { input: 'абв', description: 'string with non-Latin letters' },
      { input: ' abc', description: 'string with leading space' },
      { input: 'abc ', description: 'string with trailing space' },
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 123, description: 'number value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
      { input: {}, description: 'empty object' },
      { input: [], description: 'empty array' },
      { input: () => {}, description: 'function' },
      { input: new Date(), description: 'Date object' },
      { input: new Map(), description: 'Map' },
      { input: new Set(), description: 'Set' },
      { input: new WeakMap(), description: 'WeakMap' },
      { input: new WeakSet(), description: 'WeakSet' },
    ];

    errorTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as string;
        const expectedResult = new ErrorResult(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isOnlyLatinLettersString(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    test('Should return error when params.shouldReturnError is true even for valid value', () => {
      const expectedResult = new ErrorResult(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE, undefined);
      const actualResult = isOnlyLatinLettersString('abc', { shouldReturnError: true });
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('isOnlyLatinLettersString success cases', () => {
    const successTestCases = [
      { input: 'a', description: 'single lowercase letter' },
      { input: 'A', description: 'single uppercase letter' },
      { input: 'abc', description: 'lowercase letters' },
      { input: 'ABC', description: 'uppercase letters' },
      { input: 'aBc', description: 'mixed case letters' },
      { input: 'abcdefghijklmnopqrstuvwxyz', description: 'all lowercase letters' },
      { input: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', description: 'all uppercase letters' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isOnlyLatinLettersString(input);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

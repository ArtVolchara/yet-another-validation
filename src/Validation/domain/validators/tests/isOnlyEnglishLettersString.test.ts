import isOnlyEnglishLettersString, { IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE } from '../isOnlyEnglishLettersString';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isOnlyEnglishLettersString validator test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: '', description: 'empty string' },
      { input: '123', description: 'string with digits' },
      { input: 'abc123', description: 'string with letters and digits' },
      { input: '123abc', description: 'string with digits and letters' },
      { input: 'abc def', description: 'string with space' },
      { input: 'abc!', description: 'string with special character' },
      { input: 'абв', description: 'string with non-English letters' },
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
        const expectedResult = new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isOnlyEnglishLettersString(inputValue);

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
        const expectedResult = new ErrorResult(IS_ONLY_ENGLISH_LETTERS_STRING_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isOnlyEnglishLettersString(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

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
        const actualResult = isOnlyEnglishLettersString(input);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

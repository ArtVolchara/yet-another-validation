import { describe, test, expect } from 'vitest';
import isArrayMaxLength, { generateArrayMaxLengthErrorMessage } from '../isArrayMaxLength';
import { SuccessResult, ErrorResult } from '../../../../_Root/domain/factories';

// There are no tests for string, function, array-like objects and typed arrays values, which may lead to false positive results,
// because isArrayMaxLength has the input parameter of array type, it is made as next item in validation rules chain
// after the rule that checks if the value is an array.
describe('isArrayMaxLength validation rule test', () => {
  const maxLength = 2;
  describe('isArrayMaxLength error cases', () => {
    const errorTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 0, description: 'number value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
      { input: {}, description: 'empty object' },
      { input: new Date(), description: 'Date object' },
      { input: new Map(), description: 'Map' },
      { input: new Set(), description: 'Set' },
      { input: new WeakMap(), description: 'WeakMap' },
      { input: new WeakSet(), description: 'WeakSet' },
      { input: new DataView(new ArrayBuffer(8)), description: 'DataView' },
      { input: new ArrayBuffer(8), description: 'ArrayBuffer' },
      { input: new SharedArrayBuffer(8), description: 'SharedArrayBuffer' },
      { input: [1, 2, 3], description: `Array with length larger than ${maxLength}` },
    ];

    errorTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as unknown[];
        const expectedResult = new ErrorResult(generateArrayMaxLengthErrorMessage(maxLength), undefined);

        // Act
        const actualResult = isArrayMaxLength(maxLength)(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    test('Should return error when params.shouldReturnError is true even for valid value', () => {
      const value = [1];
      const expectedResult = new ErrorResult(generateArrayMaxLengthErrorMessage(maxLength), undefined);
      const actualResult = isArrayMaxLength(maxLength)(value, { shouldReturnError: true });
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('isArrayMaxLength success cases', () => {
    const successTestCases = [
      { input: [1, 2], description: 'array with length equal to maxLength' },
      { input: [1], description: 'array with length less than maxLength' },
      { input: [], description: 'empty array' },
      { input: ['a', 'b'], description: 'array with strings' },
      { input: [true, false], description: 'array with booleans' },
      { input: [{}], description: 'array with objects' },
      { input: [[], []], description: 'array with arrays' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isArrayMaxLength(maxLength)(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

import isArrayMaxLength from '../isArrayMaxLength';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

// There are no tests for string, function, array-like objects and typed arrays values, which may lead to false positive results,
// because isArrayMaxLength has the input parameter of array type, it is made as next item in validator chain
// after the validator that checks if the value is an array.
describe('isArrayMaxLength validator test', () => {
  const maxLength = 2;
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 0, description: 'number value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as unknown[];
        const expectedResult = new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);

        // Act
        const actualResult = isArrayMaxLength(maxLength)(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('Non-primitive values', () => {
    const nonPrimitiveTestCases = [
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

    nonPrimitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as unknown[];
        const expectedResult = new ErrorResult(`Array should contain less than ${maxLength} elements`, undefined);

        // Act
        const actualResult = isArrayMaxLength(maxLength)(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

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

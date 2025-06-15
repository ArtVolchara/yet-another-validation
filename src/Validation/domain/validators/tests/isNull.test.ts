import isNull, { IS_NULL_ERROR_MESSAGE } from '../isNull';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isNull validator test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: undefined, description: 'undefined value' },
      { input: 'hello', description: 'string value' },
      { input: 0, description: 'number value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as null;
        const expectedResult = new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isNull(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
    const successTestCases = [
      { input: null, description: 'null value' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isNull(inputValue);

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
        const inputValue = input as unknown as null;
        const expectedResult = new ErrorResult(IS_NULL_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isNull(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

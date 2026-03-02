import { describe, test, expect } from "vitest";
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../isPositiveNumber';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

// There are no tests for string and Date values, which may lead to false positive results,
// because isPositiveNumber has the input parameter of number type, it is made as second item in validation rules chain
// where the first item is the rule that checks if the value is a number.
describe('isPositiveNumber validation rule test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: 0, description: 'zero' },
      { input: -1, description: 'negative integer' },
      { input: -1.5, description: 'negative decimal' },
      { input: -Infinity, description: 'negative infinity' },
      { input: NaN, description: 'NaN' },
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as number;
        const expectedResult = new ErrorResult(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isPositiveNumber(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: 1, description: 'smallest positive integer' },
      { input: 1.5, description: 'small positive decimal' },
      { input: 1000000, description: 'large positive integer' },
      { input: Number.MAX_SAFE_INTEGER, description: 'largest positive integer' },
      { input: Number.MIN_VALUE, description: 'smallest positive number' },
      { input: Infinity, description: 'positive infinity' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isPositiveNumber(input);

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
      { input: new Map(), description: 'Map' },
      { input: new Set(), description: 'Set' },
      { input: new WeakMap(), description: 'WeakMap' },
      { input: new WeakSet(), description: 'WeakSet' },
      { input: new Map(), description: 'Map' },
      { input: new Set(), description: 'Set' },
      { input: new Int8Array(), description: 'Int8Array' },
      { input: new Uint8Array(), description: 'Uint8Array' },
      { input: new Int16Array(), description: 'Int16Array' },
      { input: new Uint16Array(), description: 'Uint16Array' },
      { input: new Int32Array(), description: 'Int32Array' },
      { input: new Uint32Array(), description: 'Uint32Array' },
      { input: new Float32Array(), description: 'Float32Array' },
      { input: new Float64Array(), description: 'Float64Array' },
      { input: new BigInt64Array(), description: 'BigInt64Array' },
      { input: new BigUint64Array(), description: 'BigUint64Array' },
      { input: new ArrayBuffer(8), description: 'ArrayBuffer' },
      { input: new SharedArrayBuffer(8), description: 'SharedArrayBuffer' },
    ];

    nonPrimitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as number;
        const expectedResult = new ErrorResult(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isPositiveNumber(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

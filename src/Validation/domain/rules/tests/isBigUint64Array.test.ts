import { describe, test, expect } from "vitest";
import isBigUint64Array, { IS_BIGUINT64_ARRAY_ERROR_MESSAGE } from '../isBigUint64Array';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isBigUint64Array validation rule test', () => {
  describe('Primitive values', () => {
    const primitiveTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 'hello', description: 'string value' },
      { input: 0, description: 'number value' },
      { input: false, description: 'boolean value' },
      { input: Symbol('foo'), description: 'Symbol value' },
    ];

    primitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as BigUint64Array;
        const expectedResult = new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isBigUint64Array(inputValue);

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
      { input: new Int8Array(), description: 'Int8Array' },
      { input: new Uint8Array(), description: 'Uint8Array' },
      { input: new Int16Array(), description: 'Int16Array' },
      { input: new Uint16Array(), description: 'Uint16Array' },
      { input: new Int32Array(), description: 'Int32Array' },
      { input: new Uint32Array(), description: 'Uint32Array' },
      { input: new Float32Array(), description: 'Float32Array' },
      { input: new Float64Array(), description: 'Float64Array' },
      { input: new BigInt64Array(), description: 'BigInt64Array' },
      { input: new DataView(new ArrayBuffer(8)), description: 'DataView' },
      { input: new ArrayBuffer(8), description: 'ArrayBuffer' },
      { input: new SharedArrayBuffer(8), description: 'SharedArrayBuffer' },
    ];

    nonPrimitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as BigUint64Array;
        const expectedResult = new ErrorResult(IS_BIGUINT64_ARRAY_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isBigUint64Array(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: new BigUint64Array(), description: 'empty BigUint64Array' },
      { input: new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)]), description: 'BigUint64Array with values' },
      { input: new BigUint64Array([BigInt(0), BigInt('18446744073709551615')]), description: 'BigUint64Array with min/max values' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isBigUint64Array(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

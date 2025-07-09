import { describe, test, expect } from "vitest";
import isSharedArrayBuffer, { IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE } from '../isSharedArrayBuffer';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isSharedArrayBuffer validation rule test', () => {
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
        const inputValue = input as unknown as SharedArrayBuffer;
        const expectedResult = new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isSharedArrayBuffer(inputValue);

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
      { input: new Int8Array(3), description: 'Int8Array' },
      { input: new Uint8Array(3), description: 'Uint8Array' },
      { input: new Int16Array(3), description: 'Int16Array' },
      { input: new Uint16Array(3), description: 'Uint16Array' },
      { input: new Int32Array(3), description: 'Int32Array' },
      { input: new Uint32Array(3), description: 'Uint32Array' },
      { input: new Float32Array(3), description: 'Float32Array' },
      { input: new Float64Array(3), description: 'Float64Array' },
      { input: new BigInt64Array(3), description: 'BigInt64Array' },
      { input: new BigUint64Array(3), description: 'BigUint64Array' },
      { input: new DataView(new ArrayBuffer(8)), description: 'DataView' },
      { input: new ArrayBuffer(8), description: 'ArrayBuffer' },
    ];

    nonPrimitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as SharedArrayBuffer;
        const expectedResult = new ErrorResult(IS_SHARED_ARRAY_BUFFER_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isSharedArrayBuffer(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: new SharedArrayBuffer(8), description: 'SharedArrayBuffer with 8 bytes' },
      { input: new SharedArrayBuffer(16), description: 'SharedArrayBuffer with 16 bytes' },
      { input: new SharedArrayBuffer(32), description: 'SharedArrayBuffer with 32 bytes' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isSharedArrayBuffer(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
}); 
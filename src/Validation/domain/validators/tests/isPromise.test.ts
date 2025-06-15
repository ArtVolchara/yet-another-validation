import isPromise, { IS_PROMISE_ERROR_MESSAGE } from '../isPromise';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isPromise validator test', () => {
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
        const inputValue = input as unknown as Promise<unknown>;
        const expectedResult = new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isPromise(inputValue);

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
      { input: new BigUint64Array(), description: 'BigUint64Array' },
      { input: new DataView(new ArrayBuffer(8)), description: 'DataView' },
    ];

    nonPrimitiveTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input as unknown as Promise<unknown>;
        const expectedResult = new ErrorResult(IS_PROMISE_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isPromise(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: Promise.resolve(), description: 'resolved Promise' },
      { input: Promise.reject(), description: 'rejected Promise' },
      { input: new Promise((resolve) => setTimeout(resolve, 100)), description: 'pending Promise' },
      { input: Promise.resolve('value'), description: 'Promise with value' },
      { input: Promise.resolve({ key: 'value' }), description: 'Promise with object' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, async () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isPromise(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);

        // Cleanup
        if (actualResult instanceof SuccessResult) {
          try {
            await actualResult.data;
          } catch {
            // Ignore rejections in cleanup
          }
        }
      }, 1000); // Add timeout of 1 second
    });
  });
});

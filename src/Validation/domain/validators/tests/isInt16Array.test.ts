import isInt16Array, { IS_INT16_ARRAY_ERROR_MESSAGE } from '../isInt16Array';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';

describe('isInt16Array validator test', () => {
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
        const inputValue = input as unknown as Int16Array;
        const expectedResult = new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isInt16Array(inputValue);

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
      { input: new Int8Array(), description: 'Int8Array' },
      { input: new Uint8Array(), description: 'Uint8Array' },
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
        const inputValue = input as unknown as Int16Array;
        const expectedResult = new ErrorResult(IS_INT16_ARRAY_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isInt16Array(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    const successTestCases = [
      { input: new Int16Array(), description: 'empty Int16Array' },
      { input: new Int16Array([1, 2, 3]), description: 'Int16Array with values' },
      { input: new Int16Array([-32768, 0, 32767]), description: 'Int16Array with min/max values' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isInt16Array(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

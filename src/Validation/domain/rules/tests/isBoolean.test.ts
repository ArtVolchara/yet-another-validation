import { describe, test, expect } from 'vitest';
import isBoolean, { IS_BOOLEAN_ERROR_MESSAGE } from '../isBoolean';
import { ErrorResult, SuccessResult } from '../../../../_Root/domain/factories';

describe('isBoolean validation rule test', () => {
  describe('isBoolean error cases', () => {
    const errorTestCases = [
      { input: null, description: 'null value' },
      { input: undefined, description: 'undefined value' },
      { input: 'hello', description: 'string value' },
      { input: 0, description: 'number value' },
      { input: Symbol('foo'), description: 'Symbol value' },
      { input: () => {}, description: 'function' },
      { input: new Date(), description: 'Date object' },
      { input: [], description: 'empty array' },
      { input: [1, 2, 3, 4], description: 'non-empty array' },
      { input: {}, description: 'empty object' },
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
    ];

    errorTestCases.forEach(({ input, description }) => {
      test(`Should return error result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined);

        // Act
        const actualResult = isBoolean(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });

    test('Should return error when params.shouldReturnError is true even for valid value', () => {
      const expectedResult = new ErrorResult(IS_BOOLEAN_ERROR_MESSAGE, undefined);
      const actualResult = isBoolean(true, { shouldReturnError: true });
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('isBoolean success cases', () => {
    const successTestCases = [
      { input: true, description: 'true value' },
      { input: false, description: 'false value' },
    ];

    successTestCases.forEach(({ input, description }) => {
      test(`Should return success result for ${description}`, () => {
        // Arrange
        const inputValue = input;
        const expectedResult = new SuccessResult(input);

        // Act
        const actualResult = isBoolean(inputValue);

        // Assert
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

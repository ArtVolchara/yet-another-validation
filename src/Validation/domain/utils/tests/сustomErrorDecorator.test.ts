import { describe, test, expect } from 'vitest';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';
import { IError } from '../../../../_Root/domain/types/Result/IError';
import { ISuccess } from '../../../../_Root/domain/types/Result/ISuccess';
import customErrorDecorator from '../customErrorDecorator';

describe('сustomErrorDecorator', () => {
  describe('With static error', () => {
    test('Should return custom error when validation fails', () => {
      // Arrange
      const mockValidationRule = (value: any, error: IError<string, undefined>) => {
        if (typeof value !== 'string') {
          return error;
        }
        return new SuccessResult(value);
      };
      const customError = new ErrorResult('Custom error message', undefined);
      const decorator = customErrorDecorator(mockValidationRule, customError);
      const inputValue = 123;
      const expectedResult = customError;

      // Act
      const actualResult = decorator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    test('Should return success when validation passes', () => {
      // Arrange
      const mockValidationRule = (value: any, error: IError<string, undefined>) => {
        if (typeof value !== 'string') {
          return error;
        }
        return new SuccessResult(value);
      };
      const customError = new ErrorResult('Custom error message', undefined);
      const decorator = customErrorDecorator(mockValidationRule, customError);
      const inputValue = 'hello';
      const expectedResult = new SuccessResult('hello');

      // Act
      const actualResult = decorator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    test('Should work with different validation rules', () => {
      // Arrange
      const isNumberRule = (value: any, error: IError<string, undefined>) => {
        if (typeof value !== 'number') {
          return error;
        }
        return new SuccessResult(value);
      };
      const customError = new ErrorResult('Must be a number', undefined);
      const decorator = customErrorDecorator(isNumberRule, customError);

      // Act & Assert - with invalid value
      expect(decorator('not a number')).toEqual(customError);

      // Act & Assert - with valid value
      expect(decorator(42)).toEqual(new SuccessResult(42));
    });
  });

  describe('With error factory', () => {
    test('Should return custom error from factory when validation fails', () => {
      // Arrange
      const mockValidationRule = (value: any, errorFactory: (data: { actualType: string }) => IError<string, typeof data>) => {
        if (!Array.isArray(value)) {
          return errorFactory({ actualType: typeof value });
        }
        return new SuccessResult(value);
      };
      const errorFactory = (data: { actualType: string }) => new ErrorResult(`Expected array but got ${data.actualType}`, data);
      const decorator = customErrorDecorator(mockValidationRule, errorFactory);
      const inputValue = 'not an array';
      const expectedResult = new ErrorResult('Expected array but got string', { actualType: 'string' });

      // Act
      const actualResult = decorator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    test('Should return success when validation passes with error factory', () => {
      // Arrange
      const mockValidationRule = (value: any, errorFactory: (data: { actualType: string }) => IError<string, typeof data>) => {
        if (!Array.isArray(value)) {
          return errorFactory({ actualType: typeof value });
        }
        return new SuccessResult(value);
      };
      const errorFactory = (data: { actualType: string }) => new ErrorResult(`Expected array but got ${data.actualType}`, data);
      const decorator = customErrorDecorator(mockValidationRule, errorFactory);
      const inputValue = [1, 2, 3];
      const expectedResult = new SuccessResult([1, 2, 3]);

      // Act
      const actualResult = decorator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    test('Should pass correct data to error factory', () => {
      // Arrange
      const mockValidationRule = (value: any, errorFactory: (data: undefined) => IError<string, any>) => {
        if (value < 0) {
          return errorFactory(value);
        }
        return new SuccessResult(value);
      };
      const errorFactory = (data: undefined) => new ErrorResult('Invalid value', data);
      const decorator = customErrorDecorator(mockValidationRule, errorFactory);
      const inputValue = -5;
      const expectedResult = new ErrorResult('Invalid value', -5);

      // Act
      const actualResult = decorator(inputValue);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('Edge cases', () => {
    test('Should handle validation rule that always succeeds', () => {
      // Arrange
      const alwaysSuccessRule = (value: any, error: IError<string, undefined>) => new SuccessResult(value);
      const customError = new ErrorResult('Should not appear', undefined);
      const decorator = customErrorDecorator(alwaysSuccessRule, customError);

      // Act & Assert
      expect(decorator('anything')).toEqual(new SuccessResult('anything'));
      expect(decorator(123)).toEqual(new SuccessResult(123));
      expect(decorator(null)).toEqual(new SuccessResult(null));
    });

    test('Should handle validation rule that always fails', () => {
      // Arrange
      const alwaysFailRule = (value: any, error: IError<string, undefined>) => error;
      const customError = new ErrorResult('Always fails', undefined);
      const decorator = customErrorDecorator(alwaysFailRule, customError);

      // Act & Assert
      expect(decorator('anything')).toEqual(customError);
      expect(decorator(123)).toEqual(customError);
      expect(decorator(null)).toEqual(customError);
    });

    test('Should work with complex data types', () => {
      // Arrange
      const complexRule = (value: any, error: IError<string, undefined>) => {
        if (!value || typeof value !== 'object' || !('id' in value)) {
          return error;
        }
        return new SuccessResult(value);
      };
      const customError = new ErrorResult('Invalid object', undefined);
      const decorator = customErrorDecorator(complexRule, customError);

      // Act & Assert - valid object
      const validObject = { id: 1, name: 'test' };
      expect(decorator(validObject)).toEqual(new SuccessResult(validObject));

      // Act & Assert - invalid object
      expect(decorator({ name: 'test' })).toEqual(customError);
      expect(decorator('not an object')).toEqual(customError);
    });
  });

  describe('Type inference', () => {
    test('Should infer correct return type for decorated validator', () => {
      // Arrange
      const stringRule = (value: any, error: IError<string, undefined>): ISuccess<string> | IError<string, undefined> => {
        if (typeof value !== 'string') {
          return error;
        }
        return new SuccessResult(value);
      };
      const customError = new ErrorResult('Must be string', undefined);
      const decorator = customErrorDecorator(stringRule, customError);

      // Act
      const result = decorator('test');

      // Assert
      expect(result).toEqual(new SuccessResult('test'));
    });
  });
});

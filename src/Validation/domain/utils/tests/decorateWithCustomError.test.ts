import { describe, test, expect } from 'vitest';
import { SuccessResult, ErrorResult } from '../../../../_Root/domain/factories';
import { IError } from '../../../../_Root/domain/types/Result/IError';
import decorateWithCustomError from '../decorateWithCustomError';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import { isArray, isOnlyDigitsString } from '../../rules';
import { composeValidator } from '../../factories';

const createMockStringRule = () => (value: any, params?: { shouldReturnError?: boolean }) => {
  if (params?.shouldReturnError === true) return new ErrorResult('Mock string error', undefined);
  if (typeof value !== 'string') return new ErrorResult('Mock string error', undefined);
  return new SuccessResult(value);
};

const createMockNumberRule = () => (value: any, params?: { shouldReturnError?: boolean }) => {
  if (params?.shouldReturnError === true) return new ErrorResult('Mock number error', undefined);
  if (typeof value !== 'number') return new ErrorResult('Mock number error', undefined);
  return new SuccessResult(value);
};

describe('decorateWithCustomError', () => {
  describe('decorateWithCustomError error cases', () => {
    describe('with static error and mock rules', () => {
      test('Should replace mock rule error with static custom error', () => {
        const mockRule = createMockStringRule();
        const customError = new ErrorResult('Custom error', undefined);
        const decorated = decorateWithCustomError(mockRule, customError);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(customError);
      });

      test('Should replace mock rule error with static custom error for different rule', () => {
        const mockRule = createMockNumberRule();
        const customError = new ErrorResult('Must be a number', undefined);
        const decorated = decorateWithCustomError(mockRule, customError);

        const actualResult = decorated('not a number');

        expect(actualResult).toEqual(customError);
      });
    });

    describe('with static error and real rules', () => {
      test('Should replace isString error with static custom error for non-string value', () => {
        const customError = new ErrorResult('Must be a string!', undefined);
        const decorated = decorateWithCustomError(isString, customError);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(customError);
      });

      test('Should replace isNumber error with static custom error for non-number value', () => {
        const customError = new ErrorResult('Must be a number!', undefined);
        const decorated = decorateWithCustomError(isNumber, customError);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(customError);
      });
    });

    describe('with static error and composed validators', () => {
      test('Should replace composed validator error when first rule fails', () => {
        const customError = new ErrorResult('Value must be a digit string', undefined);
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(customError);
      });

      test('Should replace composed validator error when second rule fails', () => {
        const customError = new ErrorResult('Value must be a digit string', undefined);
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated('abc');

        expect(actualResult).toEqual(customError);
      });

      test('Should replace composed OR-validator error when all branches fail', () => {
        const customError = new ErrorResult('Must be string or array', undefined);
        const validator = composeValidator([[isString], [isArray]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(customError);
      });
    });

    describe('with error factory and mock rules', () => {
      test('Should call error factory with original error when mock rule fails', () => {
        const mockRule = createMockNumberRule();
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Custom: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(mockRule, errorFactory);

        const actualResult = decorated('text');

        expect(actualResult).toEqual(
          new ErrorResult('Custom: Mock number error', undefined),
        );
      });
    });

    describe('with error factory and real rules', () => {
      test('Should call error factory with original error when isString fails', () => {
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Custom: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(isString, errorFactory);

        const actualResult = decorated(null);

        expect(actualResult).toEqual(
          new ErrorResult(`Custom: ${IS_STRING_ERROR_MESSAGE}`, undefined),
        );
      });

      test('Should call error factory with original error when isNumber fails', () => {
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Custom: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(isNumber, errorFactory);

        const actualResult = decorated('abc');

        expect(actualResult).toEqual(
          new ErrorResult(`Custom: ${IS_NUMBER_ERROR_MESSAGE}`, undefined),
        );
      });
    });

    describe('with error factory and composed validators', () => {
      test('Should call error factory with composed validator error when validation fails', () => {
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const errorFactory = (error: IError<string, any>) => new ErrorResult('Digit string required', error.errors);
        const decorated = decorateWithCustomError(validator, errorFactory);

        const actualResult = decorated(42);

        expect(actualResult.status).toBe('error');
        expect((actualResult as IError<string, any>).message).toBe('Digit string required');
      });
    });

    describe('shouldReturnError with static error', () => {
      test('Should return static custom error when shouldReturnError is true with mock rule for valid value', () => {
        const mockRule = createMockStringRule();
        const customError = new ErrorResult('Forced error', undefined);
        const decorated = decorateWithCustomError(mockRule, customError);

        const actualResult = decorated('validString', { shouldReturnError: true });

        expect(actualResult).toEqual(customError);
      });

      test('Should return static custom error when shouldReturnError is true with isString for valid string', () => {
        const customError = new ErrorResult('Forced string error', undefined);
        const decorated = decorateWithCustomError(isString, customError);

        const actualResult = decorated('hello', { shouldReturnError: true });

        expect(actualResult).toEqual(customError);
      });

      test('Should return static custom error when shouldReturnError is true with isNumber for valid number', () => {
        const customError = new ErrorResult('Forced number error', undefined);
        const decorated = decorateWithCustomError(isNumber, customError);

        const actualResult = decorated(42, { shouldReturnError: true });

        expect(actualResult).toEqual(customError);
      });

      test('Should return static custom error when shouldReturnError is true with composed validator for valid value', () => {
        const customError = new ErrorResult('Forced validator error', undefined);
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated('123', { shouldReturnError: true });

        expect(actualResult).toEqual(customError);
      });
    });

    describe('shouldReturnError with error factory', () => {
      test('Should call error factory when shouldReturnError is true with mock rule for valid value', () => {
        const mockRule = createMockNumberRule();
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Forced: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(mockRule, errorFactory);

        const actualResult = decorated(42, { shouldReturnError: true });

        expect(actualResult).toEqual(
          new ErrorResult('Forced: Mock number error', undefined),
        );
      });

      test('Should call error factory when shouldReturnError is true with isString for valid string', () => {
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Forced: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(isString, errorFactory);

        const actualResult = decorated('hello', { shouldReturnError: true });

        expect(actualResult).toEqual(
          new ErrorResult(`Forced: ${IS_STRING_ERROR_MESSAGE}`, undefined),
        );
      });

      test('Should call error factory when shouldReturnError is true with composed validator for valid value', () => {
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const errorFactory = (error: IError<string, any>) => new ErrorResult('Forced validator error', error.errors);
        const decorated = decorateWithCustomError(validator, errorFactory);

        const actualResult = decorated('123', { shouldReturnError: true });

        expect(actualResult.status).toBe('error');
        expect((actualResult as IError<string, any>).message).toBe('Forced validator error');
      });
    });
  });

  describe('decorateWithCustomError success cases', () => {
    describe('with static error and mock rules', () => {
      test('Should pass through success from mock rule', () => {
        const mockRule = createMockStringRule();
        const customError = new ErrorResult('Custom error', undefined);
        const decorated = decorateWithCustomError(mockRule, customError);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from mock number rule', () => {
        const mockRule = createMockNumberRule();
        const customError = new ErrorResult('Custom error', undefined);
        const decorated = decorateWithCustomError(mockRule, customError);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(new SuccessResult(42));
      });
    });

    describe('with static error and real rules', () => {
      test('Should pass through success from isString for valid string', () => {
        const customError = new ErrorResult('Must be a string!', undefined);
        const decorated = decorateWithCustomError(isString, customError);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from isNumber for valid number', () => {
        const customError = new ErrorResult('Must be a number!', undefined);
        const decorated = decorateWithCustomError(isNumber, customError);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(new SuccessResult(42));
      });
    });

    describe('with static error and composed validators', () => {
      test('Should pass through success from composed validator for valid digit string', () => {
        const customError = new ErrorResult('Value must be a digit string', undefined);
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated('123');

        expect(actualResult).toEqual(new SuccessResult('123'));
      });

      test('Should pass through success from composed OR-validator when first branch succeeds', () => {
        const customError = new ErrorResult('Must be string or array', undefined);
        const validator = composeValidator([[isString], [isArray]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from composed OR-validator when second branch succeeds', () => {
        const customError = new ErrorResult('Must be string or array', undefined);
        const validator = composeValidator([[isString], [isArray]]);
        const decorated = decorateWithCustomError(validator, customError);

        const actualResult = decorated([1, 2, 3]);

        expect(actualResult).toEqual(new SuccessResult([1, 2, 3]));
      });
    });

    describe('with error factory and mock rules', () => {
      test('Should pass through success from mock rule when using error factory', () => {
        const mockRule = createMockNumberRule();
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Custom: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(mockRule, errorFactory);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(new SuccessResult(42));
      });
    });

    describe('with error factory and real rules', () => {
      test('Should pass through success from isString when using error factory for valid string', () => {
        const errorFactory = (error: IError<string, any>) => new ErrorResult(`Custom: ${error.message}`, undefined);
        const decorated = decorateWithCustomError(isString, errorFactory);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });
    });

    describe('with error factory and composed validators', () => {
      test('Should pass through success from composed validator when using error factory for valid value', () => {
        const validator = composeValidator([[isString, isOnlyDigitsString]]);
        const errorFactory = (error: IError<string, any>) => new ErrorResult('Digit string required', error.errors);
        const decorated = decorateWithCustomError(validator, errorFactory);

        const actualResult = decorated('456');

        expect(actualResult).toEqual(new SuccessResult('456'));
      });
    });
  });
});

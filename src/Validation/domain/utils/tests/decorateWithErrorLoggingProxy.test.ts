import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import decorateWithErrorLoggingProxy from '../decorateWithErrorLoggingProxy';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isBoolean, { IS_BOOLEAN_ERROR_MESSAGE } from '../../rules/isBoolean';
import { isOnlyDigitsString, isUndefined } from '../../rules';
import {
  composeValidator,
  createArrayValidationRule,
  createObjectValidationRule,
  createTupleValidationRule,
} from '../../factories';
import { SuccessResult } from '../../../../_Root/domain/factories';

describe('decorateWithErrorLoggingProxy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('decorateWithErrorLoggingProxy error cases', () => {
    test('Should log rule error message and return original error result', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const decoratedRule = decorateWithErrorLoggingProxy(isString, true);

      const actualResult = decoratedRule(123);

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_STRING_ERROR_MESSAGE,
        errors: undefined,
      });
      expect(consoleErrorMock).toHaveBeenCalledOnce();
      expect(consoleErrorMock).toHaveBeenCalledWith(IS_STRING_ERROR_MESSAGE);
    });

    test('Should log rule error message with prefix', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const logPrefix = 'Validation error';
      const decoratedRule = decorateWithErrorLoggingProxy(isNumber, true, logPrefix);

      const actualResult = decoratedRule('text');

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_NUMBER_ERROR_MESSAGE,
        errors: undefined,
      });
      expect(consoleErrorMock).toHaveBeenCalledOnce();
      expect(consoleErrorMock).toHaveBeenCalledWith(`${logPrefix}: ${IS_NUMBER_ERROR_MESSAGE}`);
    });

    test('Should log composed AND-validator error message', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const validator = composeValidator([[isString, isOnlyDigitsString]]);
      const decoratedValidator = decorateWithErrorLoggingProxy(validator, true);

      const actualResult = decoratedValidator(123);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(consoleErrorMock).toHaveBeenCalledOnce();
        expect(consoleErrorMock).toHaveBeenCalledWith(actualResult.message);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
      }
    });

    test('Should log composed OR-validator error message', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const validator = composeValidator([[isString], [isUndefined]]);
      const decoratedValidator = decorateWithErrorLoggingProxy(validator, true);

      const actualResult = decoratedValidator(123);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(consoleErrorMock).toHaveBeenCalledOnce();
        expect(consoleErrorMock).toHaveBeenCalledWith(actualResult.message);
        expect(actualResult.errors).toHaveLength(2);
      }
    });

    test('Should log object validation rule error message', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const objectRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });
      const decoratedRule = decorateWithErrorLoggingProxy(objectRule, true);

      const actualResult = decoratedRule({ name: 123, age: '42' });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(consoleErrorMock).toHaveBeenCalledOnce();
        expect(consoleErrorMock).toHaveBeenCalledWith(actualResult.message);
        expect(actualResult.errors.name?.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors.age?.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should log tuple validation rule error message', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const tupleRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);
      const decoratedRule = decorateWithErrorLoggingProxy(tupleRule, true);

      const actualResult = decoratedRule([123, '42']);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(consoleErrorMock).toHaveBeenCalledOnce();
        expect(consoleErrorMock).toHaveBeenCalledWith(actualResult.message);
        expect(actualResult.errors[0]?.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[1]?.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should log array validation rule error message', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const arrayRule = createArrayValidationRule(composeValidator([[isNumber]]));
      const decoratedRule = decorateWithErrorLoggingProxy(arrayRule, true);

      const actualResult = decoratedRule([1, 'wrong', 3]);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(consoleErrorMock).toHaveBeenCalledOnce();
        expect(consoleErrorMock).toHaveBeenCalledWith(actualResult.message);
        expect(actualResult.errors[1]?.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should log forced error when shouldReturnError is true', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const decoratedRule = decorateWithErrorLoggingProxy(isBoolean, true);

      const actualResult = decoratedRule(true, { shouldReturnError: true });

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_BOOLEAN_ERROR_MESSAGE,
        errors: undefined,
      });
      expect(consoleErrorMock).toHaveBeenCalledOnce();
      expect(consoleErrorMock).toHaveBeenCalledWith(IS_BOOLEAN_ERROR_MESSAGE);
    });

    test('Should return original error without logging when decorator is disabled', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const decoratedRule = decorateWithErrorLoggingProxy(isString, false);

      const actualResult = decoratedRule(123);

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_STRING_ERROR_MESSAGE,
        errors: undefined,
      });
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });

  describe('decorateWithErrorLoggingProxy success cases', () => {
    test('Should pass through rule success without logging', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const decoratedRule = decorateWithErrorLoggingProxy(isString, true);

      const actualResult = decoratedRule('hello');

      expect(actualResult).toEqual(new SuccessResult('hello'));
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    test('Should pass through composed validator success without logging', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const validator = composeValidator([[isString], [isUndefined]]);
      const decoratedValidator = decorateWithErrorLoggingProxy(validator, true);

      const actualResult = decoratedValidator(undefined);

      expect(actualResult).toEqual(new SuccessResult(undefined));
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    test('Should pass through object validation rule success without logging', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const objectRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });
      const decoratedRule = decorateWithErrorLoggingProxy(objectRule, true);

      const actualResult = decoratedRule({ name: 'Alice', age: 42 });

      expect(actualResult).toEqual(new SuccessResult({ name: 'Alice', age: 42 }));
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    test('Should pass through tuple validation rule success without logging', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const tupleRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);
      const decoratedRule = decorateWithErrorLoggingProxy(tupleRule, true);

      const actualResult = decoratedRule(['Alice', 42]);

      expect(actualResult).toEqual(new SuccessResult(['Alice', 42]));
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    test('Should pass through array validation rule success without logging', () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const arrayRule = createArrayValidationRule(composeValidator([[isNumber]]));
      const decoratedRule = decorateWithErrorLoggingProxy(arrayRule, true);

      const actualResult = decoratedRule([1, 2, 3]);

      expect(actualResult).toEqual(new SuccessResult([1, 2, 3]));
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });
  });
});

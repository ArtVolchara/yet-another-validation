import { describe, test, expect } from 'vitest';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../../_Root/domain/factories/ErrorResult';
import defaultValueDecorator from '../defaultValueDecorator';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isArray from '../../rules/isArray';
import isObject from '../../rules/isObject';
import isUndefined from '../../rules/isUndefined';
import composeValidator from '../../factories/composeValidator';
import createObjectValidationRule from '../../factories/createObjectValidationRule';
import createArrayValidationRule from '../../factories/createArrayValidationRule';

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

describe('defaultValueDecorator', () => {
  describe('defaultValueDecorator error cases', () => {
    describe('with static default value and mock rules', () => {
      test('Should return default value when mock string rule fails', () => {
        const mockRule = createMockStringRule();
        const decorated = defaultValueDecorator(mockRule, 'fallback', true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult('fallback'));
      });

      test('Should return default value when mock number rule fails', () => {
        const mockRule = createMockNumberRule();
        const decorated = defaultValueDecorator(mockRule, 0, true);

        const actualResult = decorated('not a number');

        expect(actualResult).toEqual(new SuccessResult(0));
      });
    });

    describe('with static default value and real rules', () => {
      test('Should return default value when isString fails for non-string value', () => {
        const decorated = defaultValueDecorator(isString, 'fallback', true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult('fallback'));
      });

      test('Should return default value when isNumber fails for non-number value', () => {
        const decorated = defaultValueDecorator(isNumber, 0, true);

        const actualResult = decorated('not a number');

        expect(actualResult).toEqual(new SuccessResult(0));
      });

      test('Should return empty string as default value when isString fails', () => {
        const decorated = defaultValueDecorator(isString, '', true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult(''));
      });

      test('Should return object as default value when isObject fails', () => {
        const defaultObj = { value: 0, reason: 'invalid' } as const;
        const decorated = defaultValueDecorator(isObject, defaultObj, true);

        const actualResult = decorated('not an object');

        expect(actualResult).toEqual(new SuccessResult(defaultObj));
      });

      test('Should return array as default value when isArray fails', () => {
        const defaultArr = [1, 2, 3];
        const decorated = defaultValueDecorator(isArray, defaultArr, true);

        const actualResult = decorated('not an array');

        expect(actualResult).toEqual(new SuccessResult([1, 2, 3]));
      });

      test('Should return SuccessResult instance when rule fails', () => {
        const decorated = defaultValueDecorator(isString, 'fallback', true);

        const actualResult = decorated(123);

        expect(actualResult).toBeInstanceOf(SuccessResult);
        expect(actualResult).toEqual(new SuccessResult('fallback'));
      });
    });

    describe('with static default value and composed validators', () => {
      test('Should return default value when composed string validator fails', () => {
        const validator = composeValidator([[isString]]);
        const decorated = defaultValueDecorator(validator, 'default', true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult('default'));
      });

      test('Should return default value when composed number validator fails', () => {
        const validator = composeValidator([[isNumber]]);
        const decorated = defaultValueDecorator(validator, 0, true);

        const actualResult = decorated('abc');

        expect(actualResult).toEqual(new SuccessResult(0));
      });

      test('Should return default value when composed OR-validator fails all branches', () => {
        const validator = composeValidator([[isString], [isUndefined]]);
        const decorated = defaultValueDecorator(validator, 'default', true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult('default'));
      });
    });

    describe('with default value factory and mock rules', () => {
      test('Should call factory with error when mock string rule fails', () => {
        const mockRule = createMockStringRule();
        const decorated = defaultValueDecorator(mockRule, (error) => `fallback: ${error.message}`, true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult('fallback: Mock string error'));
      });

      test('Should call factory with error when mock number rule fails', () => {
        const mockRule = createMockNumberRule();
        const decorated = defaultValueDecorator(mockRule, (error) => error.message.length, true);

        const actualResult = decorated('text');

        expect(actualResult).toEqual(new SuccessResult('Mock number error'.length));
      });
    });

    describe('with default value factory and real rules', () => {
      test('Should call factory with error when isString fails', () => {
        const decorated = defaultValueDecorator(isString, (error) => `fallback: ${error.message}`, true);

        const actualResult = decorated(123);

        expect(actualResult).toEqual(new SuccessResult(`fallback: ${IS_STRING_ERROR_MESSAGE}`));
      });

      test('Should call factory with error when isNumber fails', () => {
        const decorated = defaultValueDecorator(isNumber, (error) => error.message.length, true);

        const actualResult = decorated('text');

        expect(actualResult).toEqual(new SuccessResult(IS_NUMBER_ERROR_MESSAGE.length));
      });
    });

    describe('with default value factory and composed validators', () => {
      test('Should call factory when composed validator fails', () => {
        const validator = composeValidator([[isString]]);
        const decorated = defaultValueDecorator(validator, (error) => `default: ${error.message}`, true);

        const actualResult = decorated(123);

        expect(actualResult.status).toBe('success');
        expect(actualResult.data).toContain('default:');
      });

      test('Should call factory with array rule error when createArrayValidationRule fails', () => {
        const arrayRule = createArrayValidationRule(composeValidator([[isNumber]]));
        const decorated = defaultValueDecorator(arrayRule, () => [1], true);

        const actualResult = decorated(['not a number']);

        expect(actualResult).toEqual(new SuccessResult([1]));
      });
    });

    describe('with static default value and createObjectValidationRule', () => {
      test('Should provide default for a specific object field when field validation fails', () => {
        const objectRule = createObjectValidationRule({
          a: defaultValueDecorator(composeValidator([[isString]]), 'default-a', true),
          b: composeValidator([[isNumber]]),
        });

        const actualResult = objectRule({ a: 123, b: 42 });

        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data.a).toBe('default-a');
          expect(actualResult.data.b).toBe(42);
        }
      });
    });

    describe('with static default value and createArrayValidationRule', () => {
      test('Should apply default to failing array elements', () => {
        const safeNumberValidator = defaultValueDecorator(composeValidator([[isNumber]]), 0, true);
        const arrayRule = createArrayValidationRule(safeNumberValidator);

        const actualResult = arrayRule([1, 'not a number', 3]);

        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual([1, 0, 3]);
        }
      });
    });

    describe('shouldReturnError with static default value', () => {
      test('Should return default value when shouldReturnError is true with mock rule for valid value', () => {
        const mockRule = createMockStringRule();
        const decorated = defaultValueDecorator(mockRule, 'forced-default', true);

        const actualResult = decorated('validString', { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult('forced-default'));
      });

      test('Should return default value when shouldReturnError is true with isString for valid string', () => {
        const decorated = defaultValueDecorator(isString, 'forced-default', true);

        const actualResult = decorated('hello', { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult('forced-default'));
      });

      test('Should return default value when shouldReturnError is true with isNumber for valid number', () => {
        const decorated = defaultValueDecorator(isNumber, 0, true);

        const actualResult = decorated(42, { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult(0));
      });

      test('Should return default value when shouldReturnError is true with composed validator for valid value', () => {
        const validator = composeValidator([[isString]]);
        const decorated = defaultValueDecorator(validator, 'forced-default', true);

        const actualResult = decorated('hello', { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult('forced-default'));
      });
    });

    describe('shouldReturnError with default value factory', () => {
      test('Should call factory when shouldReturnError is true with mock rule for valid value', () => {
        const mockRule = createMockStringRule();
        const decorated = defaultValueDecorator(mockRule, (error) => `forced: ${error.message}`, true);

        const actualResult = decorated('validString', { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult('forced: Mock string error'));
      });

      test('Should call factory when shouldReturnError is true with isString for valid string', () => {
        const decorated = defaultValueDecorator(isString, (error) => `forced: ${error.message}`, true);

        const actualResult = decorated('hello', { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult(`forced: ${IS_STRING_ERROR_MESSAGE}`));
      });

      test('Should call factory when shouldReturnError is true with isNumber for valid number', () => {
        const decorated = defaultValueDecorator(isNumber, (error) => error.message.length, true);

        const actualResult = decorated(42, { shouldReturnError: true });

        expect(actualResult).toEqual(new SuccessResult(IS_NUMBER_ERROR_MESSAGE.length));
      });
    });
  });

  describe('defaultValueDecorator success cases', () => {
    describe('with static default value and mock rules', () => {
      test('Should pass through success from mock string rule', () => {
        const mockRule = createMockStringRule();
        const decorated = defaultValueDecorator(mockRule, 'fallback', true);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from mock number rule', () => {
        const mockRule = createMockNumberRule();
        const decorated = defaultValueDecorator(mockRule, 0, true);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(new SuccessResult(42));
      });
    });

    describe('with static default value and real rules', () => {
      test('Should pass through success from isString for valid string', () => {
        const decorated = defaultValueDecorator(isString, 'fallback', true);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from isNumber for valid number', () => {
        const decorated = defaultValueDecorator(isNumber, 0, true);

        const actualResult = decorated(42);

        expect(actualResult).toEqual(new SuccessResult(42));
      });
    });

    describe('with static default value and composed validators', () => {
      test('Should pass through success from composed AND-validator for valid string', () => {
        const validator = composeValidator([[isString]]);
        const decorated = defaultValueDecorator(validator, 'default', true);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from composed OR-validator when first branch succeeds', () => {
        const validator = composeValidator([[isString], [isUndefined]]);
        const decorated = defaultValueDecorator(validator, 'default', true);

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
      });

      test('Should pass through success from composed OR-validator when second branch succeeds', () => {
        const validator = composeValidator([[isString], [isUndefined]]);
        const decorated = defaultValueDecorator(validator, 'default', true);

        const actualResult = decorated(undefined);

        expect(actualResult).toEqual(new SuccessResult(undefined));
      });
    });

    describe('with default value factory and mock rules', () => {
      test('Should not call factory and pass through success from mock rule', () => {
        const mockRule = createMockStringRule();
        let isFactoryCalled = false;
        const decorated = defaultValueDecorator(
          mockRule,
          (error) => { isFactoryCalled = true; return `fallback: ${error.message}`; },
          true,
        );

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
        expect(isFactoryCalled).toBe(false);
      });
    });

    describe('with default value factory and real rules', () => {
      test('Should not call factory and pass through success from isString', () => {
        let isFactoryCalled = false;
        const decorated = defaultValueDecorator(
          isString,
          (error) => { isFactoryCalled = true; return `fallback: ${error.message}`; },
          true,
        );

        const actualResult = decorated('hello');

        expect(actualResult).toEqual(new SuccessResult('hello'));
        expect(isFactoryCalled).toBe(false);
      });
    });

    describe('with default value factory and composed validators', () => {
      test('Should not call factory and pass through success from composed validator', () => {
        let isFactoryCalled = false;
        const validator = composeValidator([[isString]]);
        const decorated = defaultValueDecorator(
          validator,
          (error) => { isFactoryCalled = true; return `default: ${error.message}`; },
          true,
        );

        const actualResult = decorated('hello');

        expect(actualResult.status).toBe('success');
        expect(isFactoryCalled).toBe(false);
      });
    });

    describe('with static default value and createObjectValidationRule', () => {
      test('Should return original values when all object fields pass validation', () => {
        const objectRule = createObjectValidationRule({
          a: defaultValueDecorator(composeValidator([[isString]]), 'default-a', true),
          b: composeValidator([[isNumber]]),
        });

        const actualResult = objectRule({ a: 'hello', b: 42 });

        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data.a).toBe('hello');
          expect(actualResult.data.b).toBe(42);
        }
      });
    });

    describe('with static default value and createArrayValidationRule', () => {
      test('Should pass through all valid array elements', () => {
        const safeNumberValidator = defaultValueDecorator(composeValidator([[isNumber]]), 0, true);
        const arrayRule = createArrayValidationRule(safeNumberValidator);

        const actualResult = arrayRule([1, 2, 3]);

        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual([1, 2, 3]);
        }
      });
    });
  });
});

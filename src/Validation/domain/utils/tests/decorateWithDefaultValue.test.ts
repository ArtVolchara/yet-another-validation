import { describe, test, expect } from 'vitest';
import { SuccessResult, ErrorResult } from '../../../../_Root/domain/factories';
import decorateWithCustomError from '../decorateWithCustomError';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isBoolean, { IS_BOOLEAN_ERROR_MESSAGE } from '../../rules/isBoolean';
import { isArray, isObject, isUndefined } from '../../rules';
import isOnlyDigitsString, {
  IS_ONLY_DIGITS_STRING_ERROR_MESSAGE,
  type TOnlyDigitsNominal,
} from '../../rules/isOnlyDigitsString';
import {
  composeValidator, createObjectValidationRule, createArrayValidationRule, createTupleValidationRule,
  decorateWithDefaultValue,
} from '../../factories';

describe('decorateWithDefaultValue', () => {
  describe('decorateWithDefaultValue error cases', () => {
    test('Should enrich rule error with static default data', () => {
      const expectedDefaultValue = 'fallback';
      const decoratedRule = decorateWithDefaultValue(isString, expectedDefaultValue, true);

      const actualResult = decoratedRule(123);

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_STRING_ERROR_MESSAGE,
        errors: undefined,
        data: expectedDefaultValue,
      });
    });

    test('Should enrich rule error with data from default factory', () => {
      const decoratedRule = decorateWithDefaultValue(isNumber, (error) => error.message.length, true);

      const actualResult = decoratedRule('text');

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_NUMBER_ERROR_MESSAGE,
        errors: undefined,
        data: IS_NUMBER_ERROR_MESSAGE.length,
      });
    });

    test('Should enrich composed AND-validator error with default data', () => {
      const validator = composeValidator([[isString, isOnlyDigitsString]]);
      const expectedDefaultValue = '000' as unknown as string & TOnlyDigitsNominal;
      const decoratedValidator = decorateWithDefaultValue(validator, expectedDefaultValue, true);

      const actualResult = decoratedValidator('abc');

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toBe(expectedDefaultValue);
        expect(actualResult.message).toContain(
          IS_ONLY_DIGITS_STRING_ERROR_MESSAGE,
        );
      }
    });

    test('Should enrich composed OR-validator error with default data', () => {
      const validator = composeValidator([[isString], [isUndefined]]);
      const expectedDefaultValue = 'empty';
      const decoratedValidator = decorateWithDefaultValue(validator, expectedDefaultValue, true);

      const actualResult = decoratedValidator(123);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toBe(expectedDefaultValue);
        expect(actualResult.errors).toHaveLength(2);
      }
    });

    test('Should enrich object validation rule error with default object data', () => {
      const objectRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });
      const expectedDefaultValue = { name: 'unknown', age: 0 };
      const decoratedRule = decorateWithDefaultValue(objectRule, expectedDefaultValue, true);

      const actualResult = decoratedRule({ name: 123, age: '42' });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toEqual(expectedDefaultValue);
        expect(actualResult.errors.name?.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors.age?.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should enrich tuple validation rule error with default tuple data', () => {
      const tupleRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);
      const expectedDefaultValue: [string, number] = ['unknown', 0];
      const decoratedRule = decorateWithDefaultValue(tupleRule, expectedDefaultValue, true);

      const actualResult = decoratedRule([123, '42']);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toEqual(expectedDefaultValue);
        expect(actualResult.errors[0]?.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[1]?.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should enrich array validation rule error with default array data', () => {
      const numberValidator = composeValidator([[isNumber]]);
      const arrayRule = createArrayValidationRule(numberValidator);
      const expectedDefaultValue = [0];
      const decoratedRule = decorateWithDefaultValue(arrayRule, expectedDefaultValue, true);

      const actualResult = decoratedRule([1, 'wrong', 3]);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toEqual(expectedDefaultValue);
        expect(actualResult.errors[1]?.message).toContain(IS_NUMBER_ERROR_MESSAGE);
      }
    });

    test('Should build object default data from decorated field validator errors', () => {
      const expectedProfileDefaultValue = { nickname: 'anonymous' };
      const expectedScoresDefaultValue = [0, 0];
      const expectedCoordinatesDefaultValue: [number, string] = [0, 'zero'];
      const objectRule = decorateWithDefaultValue(
        createObjectValidationRule({
          name: decorateWithDefaultValue(composeValidator([[isString]]), 'john', true),
          lastName: decorateWithDefaultValue(composeValidator([[isString]]), 'Doe', true),
          age: decorateWithDefaultValue(composeValidator([[isNumber]]), 0, true),
          profile: decorateWithDefaultValue(
            composeValidator([[
              isObject,
              decorateWithDefaultValue(
                createObjectValidationRule({
                  nickname: composeValidator([[isString]]),
                }),
                expectedProfileDefaultValue,
                true,
              ),
            ]]),
            expectedProfileDefaultValue,
            true,
          ),
          scores: decorateWithDefaultValue(
            composeValidator([[
              isArray,
              decorateWithDefaultValue(
                createArrayValidationRule(composeValidator([[isNumber]])),
                expectedScoresDefaultValue,
                true,
              ),
            ]]),
            expectedScoresDefaultValue,
            true,
          ),
          coordinates: decorateWithDefaultValue(
            composeValidator([[
              isArray,
              decorateWithDefaultValue(
                createTupleValidationRule([
                  composeValidator([[isNumber]]),
                  composeValidator([[isString]]),
                ]),
                expectedCoordinatesDefaultValue,
                true,
              ),
            ]]),
            expectedCoordinatesDefaultValue,
            true,
          ),
        }),
        (error) => ({
          name: error.errors.name  ? error.errors.name.data : error.valid.name!,
          lastName: error.errors.lastName ? error.errors.lastName.data : error.valid.lastName!,
          age: error.errors.age ? error.errors.age.data : error.valid.age!,
          profile: error.errors.profile ? error.errors.profile.data : error.valid.profile!,
          scores: error.errors.scores ? error.errors.scores.data : error.valid.scores!,
          coordinates: error.errors.coordinates ? error.errors.coordinates.data : error.valid.coordinates!,
        }),
        true,
      );

      const actualResult = objectRule({
        lastName: 'Doe',
        profile: { nickname: 123 },
        scores: [1, 'two'],
        coordinates: ['x', 2],
      });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toEqual({
          name: 'john',
          age: 0,
          lastName: 'Doe',
          profile: expectedProfileDefaultValue,
          scores: expectedScoresDefaultValue,
          coordinates: expectedCoordinatesDefaultValue,
        });
        expect(actualResult.errors.name?.data).toBe('john');
        expect(actualResult.errors.lastName).toBeUndefined();
        expect(actualResult.errors.age?.data).toBe(0);
        expect(actualResult.errors.profile?.data).toEqual(expectedProfileDefaultValue);
        expect(actualResult.errors.scores?.data).toEqual(expectedScoresDefaultValue);
        expect(actualResult.errors.coordinates?.data).toEqual(expectedCoordinatesDefaultValue);
      }
    });

    test('Should build tuple default data from decorated element validator errors', () => {
      const expectedProfileDefaultValue = { nickname: 'anonymous' };
      const expectedScoresDefaultValue = [0, 0];
      const expectedCoordinatesDefaultValue: [number, string] = [0, 'zero'];
      const tupleRule = decorateWithDefaultValue(
        createTupleValidationRule([
          decorateWithDefaultValue(composeValidator([[isString]]), 'john', true),
          decorateWithDefaultValue(composeValidator([[isNumber]]), 0, true),
          decorateWithDefaultValue(composeValidator([[isNumber]]), 0, true),
          decorateWithDefaultValue(
            composeValidator([[
              isObject,
              decorateWithDefaultValue(
                createObjectValidationRule({
                  nickname: composeValidator([[isString]]),
                }),
                expectedProfileDefaultValue,
                true,
              ),
            ]]),
            expectedProfileDefaultValue,
            true,
          ),
          decorateWithDefaultValue(
            composeValidator([[
              isArray,
              decorateWithDefaultValue(
                createArrayValidationRule(composeValidator([[isNumber]])),
                expectedScoresDefaultValue,
                true,
              ),
            ]]),
            expectedScoresDefaultValue,
            true,
          ),
          decorateWithDefaultValue(
            composeValidator([[
              isArray,
              decorateWithDefaultValue(
                createTupleValidationRule([
                  composeValidator([[isNumber]]),
                  composeValidator([[isString]]),
                ]),
                expectedCoordinatesDefaultValue,
                true,
              ),
            ]]),
            expectedCoordinatesDefaultValue,
            true,
          ),
        ]),
        (error) => [
          error.errors[0] ? error.errors[0].data : error.valid[0]!,
          error.errors[1] ? error.errors[1].data : error.valid[1]!,
          error.errors[2] ? error.errors[2].data : error.valid[2]!,
          error.errors[3] ? error.errors[3].data : error.valid[3]!,
          error.errors[4] ? error.errors[4].data : error.valid[4]!,
          error.errors[5] ? error.errors[5].data : error.valid[5]!,
        ],
        true,
      );

      const actualResult = tupleRule([
        123,
        '42',
        42,
        { nickname: 123 },
        [1, 'two'],
        ['x', 2],
      ]);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toEqual([
          'john',
          0,
          42,
          expectedProfileDefaultValue,
          expectedScoresDefaultValue,
          expectedCoordinatesDefaultValue,
        ]);
        expect(actualResult.errors[0]?.data).toBe('john');
        expect(actualResult.errors[1]?.data).toBe(0);
        expect(actualResult.errors[2]).toBeUndefined();
        expect(actualResult.errors[3]?.data).toEqual(expectedProfileDefaultValue);
        expect(actualResult.errors[4]?.data).toEqual(expectedScoresDefaultValue);
        expect(actualResult.errors[5]?.data).toEqual(expectedCoordinatesDefaultValue);
      }
    });

    test('Should build array default data from decorated element validator errors', () => {
      const expectedCoordinatesDefaultValue: [number, string] = [0, 'zero'];
      const arrayRule = decorateWithDefaultValue(
        createArrayValidationRule(
          decorateWithDefaultValue(
            composeValidator([[
              isArray,
              decorateWithDefaultValue(
                createTupleValidationRule([
                  composeValidator([[isNumber]]),
                  composeValidator([[isString]]),
                ]),
                expectedCoordinatesDefaultValue,
                true,
              ),
            ]]),
            expectedCoordinatesDefaultValue,
            true,
          ),
        ),
        (error) => error.errors.map((elError, index) => (elError ? elError?.data : error.valid[index]!)),
        true,
      );

      const actualResult = arrayRule([[1, 'one'], ['two', 2], [2, 'two']]);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.data).toEqual([
          [1, 'one'],
          expectedCoordinatesDefaultValue,
          [2, 'two'],
        ]);
        expect(actualResult.errors[0]).toBeUndefined();
        expect(actualResult.errors[1]?.data).toEqual(expectedCoordinatesDefaultValue);
        expect(actualResult.errors[2]).toBeUndefined();
      }
    });

    test('Should enrich custom error decorator result with default data', () => {
      const customError = new ErrorResult('Custom string error', undefined);
      const customValidator = decorateWithCustomError(
        composeValidator([[isString]]),
        customError,
      );
      const decoratedValidator = decorateWithDefaultValue(customValidator, 'fallback', true);

      const actualResult = decoratedValidator(123);

      expect(actualResult).toEqual({
        status: 'error',
        message: 'Custom string error',
        errors: undefined,
        data: 'fallback',
      });
    });

    test('Should enrich forced rule error with default data', () => {
      const decoratedRule = decorateWithDefaultValue(isBoolean, false, true);

      const actualResult = decoratedRule(true, { shouldReturnError: true });

      expect(actualResult).toEqual({
        status: 'error',
        message: IS_BOOLEAN_ERROR_MESSAGE,
        errors: undefined,
        data: false,
      });
    });

    test('Should return original error without data when decorator is disabled', () => {
      const decoratedRule = decorateWithDefaultValue(isString, 'fallback', false);

      const actualResult = decoratedRule(123);

      expect(actualResult).toEqual(
        new ErrorResult(IS_STRING_ERROR_MESSAGE, undefined),
      );
    });
  });

  describe('decorateWithDefaultValue success cases', () => {
    test('Should pass through success from rule without default data', () => {
      const decorated = decorateWithDefaultValue(isString, 'fallback', true);

      const actualResult = decorated('hello');

      expect(actualResult).toEqual(new SuccessResult('hello'));
    });

    test('Should pass through success from composed AND-validator', () => {
      const validator = composeValidator([[isString, isOnlyDigitsString]]);
      const expectedDefaultValue = '000' as unknown as string & TOnlyDigitsNominal;
      const decorated = decorateWithDefaultValue(validator, expectedDefaultValue, true);

      const actualResult = decorated('123');

      expect(actualResult).toEqual(new SuccessResult('123'));
    });

    test('Should pass through success from composed OR-validator', () => {
      const validator = composeValidator([[isString], [isUndefined]]);
      const decorated = decorateWithDefaultValue(validator, 'default', true);

      const actualResult = decorated(undefined);

      expect(actualResult).toEqual(new SuccessResult(undefined));
    });

    test('Should not call default factory when rule succeeds', () => {
      let isFactoryCalled = false;
      const decorated = decorateWithDefaultValue(
        isNumber,
        (error) => {
          isFactoryCalled = true;
          return error.message.length;
        },
        true,
      );

      const actualResult = decorated(42);

      expect(actualResult).toEqual(new SuccessResult(42));
      expect(isFactoryCalled).toBe(false);
    });

    test('Should pass through success from object validation rule', () => {
      const objectRule = createObjectValidationRule({
        name: composeValidator([[isString]]),
        age: composeValidator([[isNumber]]),
      });
      const decorated = decorateWithDefaultValue(
        objectRule,
        { name: 'unknown', age: 0 },
        true,
      );

      const actualResult = decorated({ name: 'Alice', age: 42 });

      expect(actualResult).toEqual(
        new SuccessResult({ name: 'Alice', age: 42 }),
      );
    });

    test('Should pass through success from tuple validation rule', () => {
      const tupleRule = createTupleValidationRule([
        composeValidator([[isString]]),
        composeValidator([[isNumber]]),
      ]);
      const decorated = decorateWithDefaultValue(
        tupleRule,
        ['unknown', 0] as [string, number],
        true,
      );

      const actualResult = decorated(['Alice', 42]);

      expect(actualResult).toEqual(new SuccessResult(['Alice', 42]));
    });

    test('Should pass through success from array validation rule', () => {
      const numberValidator = composeValidator([[isNumber]]);
      const arrayRule = createArrayValidationRule(numberValidator);
      const decorated = decorateWithDefaultValue(arrayRule, [0], true);

      const actualResult = decorated([1, 2, 3]);

      expect(actualResult).toEqual(new SuccessResult([1, 2, 3]));
    });
  });
});

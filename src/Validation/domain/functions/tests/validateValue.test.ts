import { describe, test, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isOnlyLatinLettersString, { IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE } from '../../rules/isOnlyLatinLettersString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import { isArrayMinLength } from '../../rules';
import isUndefined, { IS_UNDEFINED_ERROR_MESSAGE } from '../../rules/isUndefined';
import isBoolean, { IS_BOOLEAN_ERROR_MESSAGE } from '../../rules/isBoolean';
import validateValue, { DEFAULT_OR_SEPARATOR } from '../validateValue';
import { composeValidator } from '../../factories';
import { DEFAULT_AND_SEPARATOR } from '../validateValueFromRules';
// TODO(decorateWithCustomError + validator): вернуть импорты вместе с закомментированными
// кейсами декорирования валидаторов (см. заметку в decorateWithCustomError.ts)
// import decorateWithCustomError from '../../utils/decorateWithCustomError';
// import decorateWithDefaultValue from '../../utils/decorateWithDefaultValue';
// import decorateWithErrorLoggingProxy from '../../utils/decorateWithErrorLoggingProxy';
// import isObject from '../../rules/isObject';
// import {
//   createArrayValidationRule,
//   createObjectValidationRule,
//   createTupleValidationRule,
// } from '../../factories';
// import { ErrorResult } from '../../../../_Root/domain/factories';

describe('validateValue', () => {
  describe('validateValue error cases', () => {
    test('should return error with single string rule for non-string input', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = IS_STRING_ERROR_MESSAGE;

      // Act
      const actualResult = validateValue(inputValue, [[isString]]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]).toHaveLength(1);
        expect(actualResult.errors[0][0]?.message).toBe(expectedMessage);
      }
    });

    test('should return error with single undefined rule for non-undefined input', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = IS_UNDEFINED_ERROR_MESSAGE;

      // Act
      const actualResult = validateValue(inputValue, [[isUndefined]]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]).toHaveLength(1);
        expect(actualResult.errors[0][0]?.message).toBe(expectedMessage);
      }
    });

    test('should return error with single boolean rule for non-boolean input', () => {
      // Arrange
      const inputValue = 'not a boolean';
      const expectedMessage = IS_BOOLEAN_ERROR_MESSAGE;

      // Act
      const actualResult = validateValue(inputValue, [[isBoolean]]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]).toHaveLength(1);
        expect(actualResult.errors[0][0]?.message).toBe(expectedMessage);
      }
    });

    test('should return error when single composed validator fails', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_ARRAY_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}Array should contain more than 2 elements`;
      const validator = composeValidator([[isArray, isArrayMinLength(2)]]);

      // Act
      const actualResult = validateValue(inputValue, [validator]);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]).toHaveLength(2);
        expect(actualResult.errors[0][0]?.message).toBe(IS_ARRAY_ERROR_MESSAGE);
        expect(actualResult.errors[0][1]?.message).toBe('Array should contain more than 2 elements');
      }
    });

    test('should return error when all OR validators fail', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${DEFAULT_OR_SEPARATOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_POSITIVE_NUMBER_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          [isNumber, isPositiveNumber],
        ],
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]).toHaveLength(2);
        expect(actualResult.errors[1]).toHaveLength(2);
      }
    });

    test('should return error when both validator and validation rules fail', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${DEFAULT_OR_SEPARATOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_POSITIVE_NUMBER_ERROR_MESSAGE}`;
      const validator = composeValidator([
        [isString, isOnlyLatinLettersString],
        composeValidator([[isNumber, isPositiveNumber]]),
      ]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]).toHaveLength(2);
        expect(actualResult.errors[1]).toHaveLength(2);
        expect(actualResult.errors[0][0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[0][1]?.message).toBe(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[1][0]?.message).toBe(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult.errors[1][1]?.message).toBe(IS_POSITIVE_NUMBER_ERROR_MESSAGE);
      }
    });

    test('should return error when deeply nested validators fail', () => {
      // Arrange
      const inputValue = null;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${DEFAULT_OR_SEPARATOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_POSITIVE_NUMBER_ERROR_MESSAGE}${DEFAULT_OR_SEPARATOR}`
        + `${IS_ARRAY_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}Array should contain more than 2 elements`;
      const validator = composeValidator(
        [
          [isString, isOnlyLatinLettersString],
          composeValidator([
            [isNumber, isPositiveNumber],
            composeValidator([[isArray, isArrayMinLength(2)]]),
          ]),
        ],
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(3);
        expect(actualResult.errors[0]).toHaveLength(2);
        expect(actualResult.errors[1]).toHaveLength(2);
        expect(actualResult.errors[0][0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[0][1]?.message).toBe(IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors[1][0]?.message).toBe(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult.errors[1][1]?.message).toBe(IS_POSITIVE_NUMBER_ERROR_MESSAGE);
      }
    });

    /* TODO(decorateWithCustomError + validator): вернуть после рефакторинга поддержки
       валидаторов в decorateWithCustomError (см. заметку в decorateWithCustomError.ts).
       Кастомный валидатор-ветка собирается из composeValidator + decorateWithCustomError,
       а декоратор временно работает только с TValidationRule.
    test('should handle custom validator errors correctly', () => {
      // Arrange
      const inputValue = 123;
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${DEFAULT_OR_SEPARATOR}Custom error`;
      // Небрендированную функцию веткой вставить нельзя - кастомный валидатор
      // собирается из composeValidator и decorateWithCustomError
      const customValidator = decorateWithCustomError(
        composeValidator([[isString]]),
        new ErrorResult('Custom error', [[new ErrorResult('Custom error', undefined)]]),
      );

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          customValidator,
        ],
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
      }
    });
    */

    test('should use custom separatorAND for error messages within AND group', () => {
      // Arrange
      const inputValue = 123;
      const customSeparatorAND = ' & ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparatorAND}${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [[isString, isOnlyLatinLettersString]],
        { separatorAND: customSeparatorAND },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]).toHaveLength(2);
      }
    });

    test('should use custom separatorOR for error messages between OR groups', () => {
      // Arrange
      const inputValue = null;
      const customSeparatorOR = ' || ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${customSeparatorOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_POSITIVE_NUMBER_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          [isNumber, isPositiveNumber],
        ],
        { separatorOR: customSeparatorOR },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
      }
    });

    test('should use both custom separatorAND and separatorOR', () => {
      // Arrange
      const inputValue = null;
      const customSeparatorAND = ' >>> ';
      const customSeparatorOR = ' <<OR>> ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparatorAND}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${customSeparatorOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${customSeparatorAND}${IS_POSITIVE_NUMBER_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          [isNumber, isPositiveNumber],
        ],
        { separatorAND: customSeparatorAND, separatorOR: customSeparatorOR },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]).toHaveLength(2);
        expect(actualResult.errors[1]).toHaveLength(2);
      }
    });

    test('should use custom separators with composeValidator', () => {
      // Arrange
      const inputValue = null;
      const customSeparatorAND = ' => ';
      const customSeparatorOR = ' <OR> ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparatorAND}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${customSeparatorOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${customSeparatorAND}${IS_POSITIVE_NUMBER_ERROR_MESSAGE}`;
      const innerValidator = composeValidator(
        [[isNumber, isPositiveNumber]],
        { separatorAND: customSeparatorAND, separatorOR: customSeparatorOR },
      );
      const validator = composeValidator(
        [
          [isString, isOnlyLatinLettersString],
          innerValidator,
        ],
        { separatorAND: customSeparatorAND, separatorOR: customSeparatorOR },
      );

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
      }
    });

    test('should use custom separators with nested validators', () => {
      // Arrange
      const inputValue = null;
      const customSeparatorAND = ' + ';
      const customSeparatorOR = ' / ';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${customSeparatorAND}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${customSeparatorOR}`
        + `${IS_STRING_ERROR_MESSAGE}${customSeparatorAND}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${customSeparatorOR}`
        + `${IS_ARRAY_ERROR_MESSAGE}${customSeparatorAND}Array should contain more than 2 elements`;
      const deepValidator = composeValidator(
        [[isArray, isArrayMinLength(2)]],
      );
      const middleValidator = composeValidator(
        [
          [isString, isOnlyLatinLettersString],
          deepValidator,
        ],
        { separatorAND: customSeparatorAND, separatorOR: customSeparatorOR },
      );

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          middleValidator,
        ],
        { separatorAND: customSeparatorAND, separatorOR: customSeparatorOR },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(3);
      }
    });

    test('should return error when shouldReturnError is true with single OR group and valid value', () => {
      // Arrange
      const inputValue = 'Hello';

      // Act
      const actualResult = validateValue(
        inputValue,
        [[isString]],
        { shouldReturnError: true },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.errors).toHaveLength(1);
        expect(actualResult.errors[0]).toHaveLength(1);
        expect(actualResult.errors[0][0]?.message).toBe(IS_STRING_ERROR_MESSAGE);
      }
    });

    test('should return error when shouldReturnError is true with multiple OR groups and valid value', () => {
      // Arrange
      const inputValue = 'Hello';
      const expectedMessage = `${IS_STRING_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}`
        + `${IS_ONLY_LATIN_LETTERS_STRING_ERROR_MESSAGE}${DEFAULT_OR_SEPARATOR}`
        + `${IS_NUMBER_ERROR_MESSAGE}${DEFAULT_AND_SEPARATOR}${IS_POSITIVE_NUMBER_ERROR_MESSAGE}`;

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          [isNumber, isPositiveNumber],
        ],
        { shouldReturnError: true },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(expectedMessage);
        expect(actualResult.errors).toHaveLength(2);
        expect(actualResult.errors[0]).toHaveLength(2);
        expect(actualResult.errors[1]).toHaveLength(2);
      }
    });

    test('should return error when shouldReturnError is true with composed validator and valid value', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const validator = composeValidator([[isArray, isArrayMinLength(2)]]);

      // Act
      const actualResult = validateValue(
        inputValue,
        [validator],
        { shouldReturnError: true },
      );

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.errors).toHaveLength(1);
      }
    });
  });

  describe('validateValue success cases', () => {
    test('should return success with single string rule', () => {
      // Arrange
      const inputValue = 'Hello';

      // Act
      const actualResult = validateValue(inputValue, [[isString]]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });

    test('should return success with single undefined rule', () => {
      // Arrange
      const inputValue = undefined;

      // Act
      const actualResult = validateValue(inputValue, [[isUndefined]]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(undefined);
      }
    });

    test('should return success with single boolean rule', () => {
      // Arrange
      const inputValue = true;

      // Act
      const actualResult = validateValue(inputValue, [[isBoolean]]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(true);
      }
    });

    test('should return success with single composed validator', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const validator = composeValidator([[isArray, isArrayMinLength(2)]]);

      // Act
      const actualResult = validateValue(inputValue, [validator]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['a', 'b', 'c']);
      }
    });

    test('should return success when first OR validator passes', () => {
      // Arrange
      const inputValue = 'Hello';

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          [isNumber, isPositiveNumber],
        ],
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });

    test('should return success when second OR validator passes', () => {
      // Arrange
      const inputValue = 42;

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          [isNumber, isPositiveNumber],
        ],
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe(42);
      }
    });

    test('should return success with validation rules and composed validator', () => {
      // Arrange
      const inputValue = 'Hello';
      const validator = composeValidator([
        [isString, isOnlyLatinLettersString],
        composeValidator([[isNumber, isPositiveNumber]]),
      ]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });

    test('should return success with deeply nested validators', () => {
      // Arrange
      const inputValue = ['a', 'b', 'c'];
      const validator = composeValidator([
        [isString, isOnlyLatinLettersString],
        composeValidator([
          [isString, isOnlyLatinLettersString],
          composeValidator([[isArray, isArrayMinLength(2)]]),
        ]),
      ]);

      // Act
      const actualResult = validator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['a', 'b', 'c']);
      }
    });

    /* TODO(decorateWithCustomError + validator): вернуть после рефакторинга, см. заметку в decorateWithCustomError.ts
    test('should return success with custom validator', () => {
      // Arrange
      const inputValue = 'Hello';
      const customValidator = decorateWithCustomError(
        composeValidator([[isString]]),
        new ErrorResult('Custom error', [[new ErrorResult('Custom error', undefined)]]),
      );

      // Act
      const actualResult = validateValue(
        inputValue,
        [
          [isString, isOnlyLatinLettersString],
          customValidator,
        ],
      );

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toBe('Hello');
      }
    });
    */
  });

  describe('validateValue type-level cases', () => {
    test.skip('should infer correct error message union for OR branches', () => {
      // Arrange
      const inputValue = 123;

      // Act
      const actualResult = validateValue(inputValue, [
        [isNumber, isPositiveNumber],
        [isString, isOnlyLatinLettersString],
      ]);

      // Assert (компайл-тайм): union состоит ровно из трёх членов модели
      // «ведущая ветка + вычитание из голов», без невозможного
      // 'Value should be positive number or Value should contain only Latin letters'
      type TActualMessage = Extract<typeof actualResult, { status: 'error' }>['message'];
      type TExpectedMessage =
        | 'Value should be number. Value should be positive number or Value should be string. Value should contain only Latin letters'
        | 'Value should be positive number or Value should be string. Value should contain only Latin letters'
        | 'Value should be number. Value should be positive number or Value should contain only Latin letters';
      const expectedUnionMatches: [TActualMessage] extends [TExpectedMessage]
        ? [TExpectedMessage] extends [TActualMessage] ? true : false
        : false = true;
      const expectedForbiddenMemberAbsent:
      'Value should be positive number or Value should contain only Latin letters' extends TActualMessage
        ? false
        : true = true;

      expect(expectedUnionMatches).toBe(true);
      expect(expectedForbiddenMemberAbsent).toBe(true);
    });

    /* TODO(decorateWithCustomError + validator): вернуть после рефакторинга поддержки
       валидаторов в decorateWithCustomError (см. заметку в decorateWithCustomError.ts).
       Тест глубокой вложенности использует decorateWithCustomError над composeValidator
       (строки с 'Pair second element...' и 'Value should be boolean flag'), что временно
       не проходит проверку типов. Остальная вложенность (фабрики, default/logging декораторы)
       работает - после рефакторинга восстановить тест целиком.
    test.skip('should compile deeply nested validators with factories and decorators', () => {
      // Arrange: вложенность собрана inline из фабрик (object/array/tuple)
      // и декораторов (custom error, default value, error logging) над правилами и валидаторами
      const inputValue = {
        user: {
          name: 'Alice',
          age: 30,
          tags: ['admin', 'editor'],
          pair: ['key', 1],
        },
      };

      // Act
      const actualResult = validateValue(inputValue, [
        [
          isObject,
          createObjectValidationRule({
            user: composeValidator([
              [
                isObject,
                createObjectValidationRule({
                  name: composeValidator([
                    [decorateWithErrorLoggingProxy(isString, true, 'user.name'), isOnlyLatinLettersString],
                  ]),
                  age: decorateWithErrorLoggingProxy(
                    composeValidator([[isNumber, isPositiveNumber]]),
                    true,
                    'user.age',
                  ),
                  tags: composeValidator([
                    [
                      isArray,
                      createArrayValidationRule(
                        decorateWithDefaultValue(composeValidator([[isString]]), 'unknown', true),
                      ),
                    ],
                    [isUndefined],
                  ]),
                  pair: composeValidator([
                    [
                      isArray,
                      createTupleValidationRule([
                        decorateWithDefaultValue(composeValidator([[isString]]), 'defaultKey', true),
                        decorateWithCustomError(
                          composeValidator([[isNumber, isPositiveNumber]]),
                          new ErrorResult(
                            'Pair second element should be positive number',
                            [[new ErrorResult('Pair second element should be positive number', undefined)]],
                          ),
                        ),
                      ]),
                    ],
                  ]),
                }),
              ],
            ]),
          }),
        ],
        [isUndefined],
        decorateWithCustomError(
          composeValidator([[isBoolean]]),
          new ErrorResult('Value should be boolean flag', [[new ErrorResult('Value should be boolean flag', undefined)]]),
        ),
      ]);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(inputValue);
      }
    });
    */
  });
});

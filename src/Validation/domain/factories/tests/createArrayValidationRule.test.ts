import { describe, test, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber from '../../rules/isNumber';
import isPositiveNumber, { IS_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isArray from '../../rules/isArray';
import isBoolean from '../../rules/isBoolean';
import isOnlyDigitsString from '../../rules/isOnlyDigitsString';
import isUndefined from '../../rules/isUndefined';
import createArrayValidationRule, {
  ARRAY_DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM,
  ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM,
  ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR,
  DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR,
} from '../createArrayValidationRule';
import composeValidator from '../composeValidator';
import SuccessResult from '../../../../_Root/domain/factories/SuccessResult';
import { TValidationParams, TValidator } from '../../types/TValidator';

describe('createArrayValidationRule', () => {
  describe('createArrayValidationRule error cases', () => {
    test('Should fail when string array contains non-string elements', () => {
      const inputValue = ['Hello', 123, 'World'];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult?.data?.[0]).toBeUndefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeUndefined();
      }
    });

    test('Should fail with empty hypernym when input is not an array', () => {
      const inputValue = 'not an array';
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue as any);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.data).toEqual([]);
      }
    });

    test('Should fail when number array contains non-positive numbers', () => {
      const inputValue = [1, -5, 0, 42];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isNumber, isPositiveNumber]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`2${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_POSITIVE_NUMBER_ERROR_MESSAGE);
        expect(actualResult.data).toHaveLength(4);
        expect(actualResult?.data?.[0]).toBeUndefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
        expect(actualResult?.data?.[3]).toBeUndefined();
      }
    });

    test('Should fail when boolean array contains non-boolean elements', () => {
      const inputValue = [true, 'false', 1, false];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isBoolean]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`2${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.data).toHaveLength(4);
        expect(actualResult?.data?.[0]).toBeUndefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
        expect(actualResult?.data?.[3]).toBeUndefined();
      }
    });

    test('Should fail when OR-validator array contains element matching neither branch', () => {
      const inputValue = ['a', 123, undefined];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString], [isUndefined]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    test('Should fail with all indices when all elements are invalid', () => {
      const inputValue = [null, undefined, 'not a number'];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isNumber]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`2${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
      }
    });

    test('Should format error messages with correct element indices for sparse failures', () => {
      const inputValue = ['valid', 123, 'valid', false];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`3${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain('\n');
      }
    });

    test('Should use custom errorMessageHypernym', () => {
      const inputValue = ['a', 123];
      const customHypernym = 'Custom hypernym';
      const arrayValidationRule = createArrayValidationRule(
        composeValidator([[isString]]),
        { errorMessageHypernym: customHypernym },
      );

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(customHypernym);
        expect(actualResult.message).not.toContain(ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM);
      }
    });

    test('Should use custom errorMessageHypernymSeparator', () => {
      const inputValue = ['a', 123];
      const customSeparator = ' ->';
      const arrayValidationRule = createArrayValidationRule(
        composeValidator([[isString]]),
        { errorMessageHypernymSeparator: customSeparator },
      );

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${customSeparator}`);
      }
    });

    test('Should use custom errorMessageIndexSeparator', () => {
      const inputValue = ['a', 123];
      const customSeparator = ' => ';
      const arrayValidationRule = createArrayValidationRule(
        composeValidator([[isString]]),
        { errorMessageIndexSeparator: customSeparator },
      );

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`1${customSeparator}`);
      }
    });

    test('Should have correct nested error structure when used inside composed validator', () => {
      const arrValidatorRule = createArrayValidationRule(composeValidator([[isString, isOnlyDigitsString]]));
      const arrValidator = composeValidator([[isArray, arrValidatorRule]]);
      const inputValue = ['5', '2', 'f'];

      const actualResult = arrValidator(inputValue);

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toHaveLength(1);
        const firstOperand = actualResult.data[0];
        expect(Array.isArray(firstOperand)).toBe(true);
        expect(firstOperand).toHaveLength(1);
        const firstValidator = firstOperand[0];
        expect(firstValidator.status).toBe('error');
        if (firstValidator.status === 'error') {
          expect(firstValidator.message).toContain(ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM);
          expect(firstValidator.data).toBeDefined();
          expect(Array.isArray(firstValidator.data)).toBe(true);
          expect(firstValidator.data).toHaveLength(3);
          expect(firstValidator.data![0]).toBeUndefined();
          expect(firstValidator.data![1]).toBeUndefined();
          expect(firstValidator.data![2]).toBeDefined();
          if (firstValidator.data![2] && typeof firstValidator.data![2] === 'object' && 'status' in firstValidator.data![2]) {
            const thirdElementError = firstValidator.data![2] as any;
            expect(thirdElementError.status).toBe('error');
            expect(thirdElementError.message).toContain('only digits');
          }
        }
      }
    });

    test('Should return error when shouldReturnError is true even for valid string array', () => {
      const inputValue = ['Hello', 'World', 'Test'];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue, { shouldReturnError: true });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.message).toContain(`2${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
      }
    });

    test('Should return error when shouldReturnError is true even for valid number array', () => {
      const inputValue = [1, 42, 100];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isNumber]]));

      const actualResult = arrayValidationRule(inputValue, { shouldReturnError: true });

      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
        expect(actualResult.data).toHaveLength(3);
        expect(actualResult?.data?.[0]).toBeDefined();
        expect(actualResult?.data?.[1]).toBeDefined();
        expect(actualResult?.data?.[2]).toBeDefined();
      }
    });

    test('Should return error when shouldReturnError is true for empty array', () => {
      const inputValue: string[] = [];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue, { shouldReturnError: true });
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain(`${ARRAY_DEFAULT_ERROR_MESSAGE_EMPTY_HYPERNYM}${ARRAY_DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}\n${IS_STRING_ERROR_MESSAGE}`);
        expect(actualResult?.data).toEqual([]);
      }
    });
  });

  describe('createArrayValidationRule success cases', () => {
    test('Should validate array of strings', () => {
      const inputValue = ['Hello', 'World', 'Test'];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['Hello', 'World', 'Test']);
      }
    });

    test('Should validate array of positive numbers', () => {
      const inputValue = [1, 42, 100];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isNumber, isPositiveNumber]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual([1, 42, 100]);
      }
    });

    test('Should validate array of booleans', () => {
      const inputValue = [true, false, true];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isBoolean]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual([true, false, true]);
      }
    });

    test('Should validate array with string or undefined elements via OR-validator', () => {
      const inputValue = ['a', undefined, 'b'];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString], [isUndefined]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['a', undefined, 'b']);
      }
    });

    test('Should successfully validate empty array', () => {
      const inputValue: string[] = [];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual([]);
      }
    });

    test('Should validate single element array', () => {
      const inputValue = ['single'];
      const arrayValidationRule = createArrayValidationRule(composeValidator([[isString]]));

      const actualResult = arrayValidationRule(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(['single']);
      }
    });

    test('Should have correct success structure when used inside composed validator', () => {
      const arrValidatorRule = createArrayValidationRule(composeValidator([[isString, isOnlyDigitsString]]));
      const arrValidator = composeValidator([[isArray, arrValidatorRule]]);
      const inputValue = ['5', '2', '3'];

      const actualResult = arrValidator(inputValue);

      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toEqual(['5', '2', '3']);
      }
    });

    test('Should pass correct path to element validators without initial path', () => {
      // Arrange
      const capturedPaths: Array<string | undefined> = [];
      const capturingValidator: TValidator = ((value: any, params?: TValidationParams) => {
        capturedPaths.push(params?.path);
        return new SuccessResult(value);
      }) as TValidator;

      const arrayRule = createArrayValidationRule(capturingValidator);

      // Act
      arrayRule(['a', 'b', 'c']);

      // Assert
      expect(capturedPaths).toEqual(['[0]', '[1]', '[2]']);
    });

    test('Should prepend parent path to element paths for nested array', () => {
      // Arrange
      const capturedPaths: Array<string | undefined> = [];
      const capturingValidator: TValidator = ((value: any, params?: TValidationParams) => {
        capturedPaths.push(params?.path);
        return new SuccessResult(value);
      }) as TValidator;

      const arrayRule = createArrayValidationRule(capturingValidator);

      // Act
      arrayRule(['js', 'ts', 'rust'], { path: 'project.tags' });

      // Assert
      expect(capturedPaths).toEqual([
        'project.tags[0]',
        'project.tags[1]',
        'project.tags[2]',
      ]);
    });
  });
});

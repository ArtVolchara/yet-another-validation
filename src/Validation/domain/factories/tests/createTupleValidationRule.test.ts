import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import isOnlyEnglishLettersString from '../../rules/isOnlyEnglishLettersString';
import createTupleValidationRule from '../createTupleValidationRule';
import createObjectValidationRule from '../createObjectValidationRule';
import composeValidator from '../composeValidator';
import isUndefined from '../../rules/isUndefined';

describe('createTupleValidationRule', () => {
  describe('Simple tuple validation', () => {
    it('should successfully validate tuple with string and number', () => {
      // Arrange
      const inputValue = ['Hello', 42] as const;
      const expectedData = ['Hello', 42];
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when tuple elements do not match validators', () => {
      // Arrange
      const inputValue = [123, 'not a number'] as const;
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
        expect(actualResult.message).toContain('0:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeDefined(); // First element has error
        expect(actualResult?.data?.[1]).toBeDefined(); // Second element has error
      }
    });

    it('should fail when input is not an array', () => {
      // Arrange
      const inputValue = 'not an array';
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue as any);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toBe(IS_ARRAY_ERROR_MESSAGE);
      }
    });
  });

  describe('Complex tuple validation', () => {
    it('should successfully validate tuple with multiple types', () => {
      // Arrange
      const inputValue = ['Alice', 30, true, [1, 2, 3]] as const;
      const expectedData = ['Alice', 30, true, [1, 2, 3]];
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isPositiveNumber]),
        composeValidator([isBoolean]),
        composeValidator([isArray]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when some tuple elements are invalid', () => {
      // Arrange
      const inputValue = ['Bob', -5, 'not boolean', [1, 2, 3]] as const;
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isPositiveNumber]),
        composeValidator([isBoolean]),
        composeValidator([isArray]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain('2:');
        expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeUndefined(); // First element is valid
        expect(actualResult?.data?.[1]).toBeDefined(); // Second element has error
        expect(actualResult?.data?.[2]).toBeDefined(); // Third element has error
        expect(actualResult?.data?.[3]).toBeUndefined(); // Fourth element is valid
      }
    });
  });

  describe('Single element tuple', () => {
    it('should successfully validate tuple with single element', () => {
      // Arrange
      const inputValue = ['Single'] as const;
      const expectedData = ['Single'];
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        expect(actualResult.data).toEqual(expectedData);
      }
    });

    it('should fail when single element is invalid', () => {
      // Arrange
      const inputValue = [123] as const;
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
        expect(actualResult.message).toContain('0:');
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult?.data?.[0]).toBeDefined();
      }
    });
  });

  describe('Mixed validation scenarios', () => {
    it('should handle tuple with all invalid elements', () => {
      // Arrange
      const inputValue = [null, 'not a number'] as const;
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
        expect(actualResult.message).toContain('0:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult?.data?.[0]).toBeDefined(); // All elements have errors
        expect(actualResult?.data?.[1]).toBeDefined();
      }
    });

    it('should handle tuple with mixed valid and invalid elements', () => {
      // Arrange
      const inputValue = ['valid', 'not a number', true] as const;
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
        composeValidator([isBoolean]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('Tuple validation failed for the following elements:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult?.data?.[0]).toBeUndefined(); // First element is valid
        expect(actualResult?.data?.[1]).toBeDefined(); // Second element has error
        expect(actualResult?.data?.[2]).toBeUndefined(); // Third element is valid
      }
    });
  });

  describe('Error message formatting', () => {
    it('should format error messages with element indices', () => {
      // Arrange
      const inputValue = [123, 'invalid', false] as const;
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
        composeValidator([isBoolean]),
      ]);

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        expect(actualResult.message).toContain('0:');
        expect(actualResult.message).toContain('1:');
        expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
        expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
        expect(actualResult.message).toContain(' ');
      }
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety for different tuple types', () => {
      // Arrange
      const stringTupleValidator = createTupleValidationRule([
        composeValidator([isString]),
      ]);
      const numberTupleValidator = createTupleValidationRule([
        composeValidator([isNumber]),
      ]);
      const booleanTupleValidator = createTupleValidationRule([
        composeValidator([isBoolean]),
      ]);

      // Act & Assert
      const stringResult = stringTupleValidator(['test']);
      const numberResult = numberTupleValidator([123]);
      const booleanResult = booleanTupleValidator([true]);

      expect(stringResult.status).toBe('success');
      expect(numberResult.status).toBe('success');
      expect(booleanResult.status).toBe('success');
    });

    it('should handle mixed type tuples correctly', () => {
      // Arrange
      const mixedTupleValidator = createTupleValidationRule([
        composeValidator([isString]),
        composeValidator([isNumber]),
        composeValidator([isBoolean]),
      ]);

      // Act
      const validResult = mixedTupleValidator(['test', 123, true]);
      const invalidResult = mixedTupleValidator(['test', 'not number', true]);

      // Assert
      expect(validResult.status).toBe('success');
      expect(invalidResult.status).toBe('error');
    });
  });

  describe('Tuple length validation', () => {
    it('should handle tuples with different lengths than validators', () => {
      // Arrange
      const tupleValidator = createTupleValidationRule([
        composeValidator([isString], [isUndefined]),
        composeValidator([isNumber]),
      ]);

      // Act
      const shortResult = tupleValidator(['only one'] as any);
      const longResult = tupleValidator(['first', 42, 'extra'] as any);

      // Assert
      expect(shortResult.status).toBe('error');
      // Note: The current implementation doesn't validate array length,
      // so longer arrays will still pass if their elements match the validators
      expect(longResult.status).toBe('success');
      if (shortResult.status === 'error') {
        expect(shortResult.message).toContain('1:');
      }
    });
  });

  describe('Type tests for tuple validation', () => {
    it('should have correct error structure for tuple validation with OR logic', () => {
      // Arrange
      const workplaceSchema = {
        position: composeValidator([isString, isOnlyEnglishLettersString]),
        company: composeValidator([isString, isOnlyEnglishLettersString]),
      };
      const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
      const workplaceValidator = composeValidator([workplaceValidationRule]);

      const tupleValidatorRule = createTupleValidationRule([workplaceValidator]);
      const tupleValidator = composeValidator([tupleValidatorRule], [isUndefined]);
      const inputValue = [{ position: '1', company: 'w' }];

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('error');
      if (actualResult.status === 'error') {
        // Проверяем структуру ошибки: массив массивов ErrorResult (OR логика)
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toHaveLength(2); // Два операнда OR

        // Первый операнд OR (tupleValidatorRule)
        const firstOperand = actualResult.data[0];
        expect(Array.isArray(firstOperand)).toBe(true);
        expect(firstOperand).toHaveLength(1); // Один валидатор в операнде

        const firstValidator = firstOperand[0];
        expect(firstValidator.status).toBe('error');
        if (firstValidator.status === 'error') {
          expect(typeof firstValidator.message).toBe('string');
          expect(firstValidator.message).toContain('Tuple validation failed');

          // Проверяем структуру данных ошибки: массив результатов для каждого элемента кортежа
          expect(Array.isArray(firstValidator.data)).toBe(true);
          expect(firstValidator.data).toHaveLength(1); // 1 элемент в кортеже

          // Элемент кортежа невалиден (ErrorResult)
          expect(firstValidator.data![0]).toBeDefined();
          if (firstValidator.data![0] && typeof firstValidator.data![0] === 'object' && 'status' in firstValidator.data![0]) {
            const tupleElementError = firstValidator.data![0] as any;
            expect(tupleElementError.status).toBe('error');
            if (tupleElementError.status === 'error') {
              expect(typeof tupleElementError.message).toBe('string');
              expect(tupleElementError.message).toContain('Object validation failed');

              // Проверяем структуру данных ошибки объекта
              expect(Array.isArray(tupleElementError.data)).toBe(true);
              expect(tupleElementError.data).toHaveLength(1); // Один операнд OR

              const objectOperand = tupleElementError.data[0];
              expect(Array.isArray(objectOperand)).toBe(true);
              expect(objectOperand).toHaveLength(1); // Один валидатор в операнде

              const objectValidator = objectOperand[0];
              expect(objectValidator.status).toBe('error');
              if (objectValidator.status === 'error') {
                expect(typeof objectValidator.message).toBe('string');
                expect(objectValidator.message).toContain('Object validation failed');

                // Проверяем структуру данных ошибки объекта
                expect(typeof objectValidator.data).toBe('object');
                expect(objectValidator.data).not.toBeNull();

                const objectData = objectValidator.data as any;
                expect(objectData.position).toBeDefined();
                // company может быть undefined, если только position имеет ошибку

                // Проверяем ошибки для полей объекта
                if (objectData.position && typeof objectData.position === 'object' && 'status' in objectData.position) {
                  const positionError = objectData.position as any;
                  expect(positionError.status).toBe('error');
                  if (positionError.status === 'error') {
                    expect(typeof positionError.message).toBe('string');
                    expect(positionError.message).toContain('only English letters');
                  }
                }

                if (objectData.company && typeof objectData.company === 'object' && 'status' in objectData.company) {
                  const companyError = objectData.company as any;
                  expect(companyError.status).toBe('error');
                  if (companyError.status === 'error') {
                    expect(typeof companyError.message).toBe('string');
                    expect(companyError.message).toContain('only English letters');
                  }
                }
              }
            }
          }
        }

        // Второй операнд OR (isUndefined)
        const secondOperand = actualResult.data[1];
        expect(Array.isArray(secondOperand)).toBe(true);
        expect(secondOperand).toHaveLength(1); // Один валидатор в операнде

        const secondValidator = secondOperand[0];
        expect(secondValidator.status).toBe('error');
        if (secondValidator.status === 'error') {
          expect(typeof secondValidator.message).toBe('string');
          expect(secondValidator.message).toContain('undefined');
        }
      }
    });

    it('should have correct success structure for tuple validation', () => {
      // Arrange
      const workplaceSchema = {
        position: composeValidator([isString, isOnlyEnglishLettersString]),
        company: composeValidator([isString, isOnlyEnglishLettersString]),
      };
      const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
      const workplaceValidator = composeValidator([workplaceValidationRule]);

      const tupleValidatorRule = createTupleValidationRule([workplaceValidator]);
      const tupleValidator = composeValidator([tupleValidatorRule]);
      const inputValue = [{ position: 'Manager', company: 'TechCorp' }] as const;

      // Act
      const actualResult = tupleValidator(inputValue);

      // Assert
      expect(actualResult.status).toBe('success');
      if (actualResult.status === 'success') {
        // Проверяем структуру успешного результата
        expect(Array.isArray(actualResult.data)).toBe(true);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0]).toEqual({ position: 'Manager', company: 'TechCorp' });
      }
    });
  });
});

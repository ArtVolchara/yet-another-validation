import { describe, it, expect } from 'vitest';
import isString, { IS_STRING_ERROR_MESSAGE } from '../../rules/isString';
import isNumber, { IS_NUMBER_ERROR_MESSAGE } from '../../rules/isNumber';
import isPositiveNumber, { IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE } from '../../rules/isPositiveNumber';
import isBoolean from '../../rules/isBoolean';
import isArray, { IS_ARRAY_ERROR_MESSAGE } from '../../rules/isArray';
import isOnlyEnglishLettersString from '../../rules/isOnlyEnglishLettersString';
import isUndefined from '../../rules/isUndefined';
import createTupleValidationRule, { DEFAULT_ERROR_MESSAGE_HYPERNYM, DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR, DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR } from '../createTupleValidationRule';
import createObjectValidationRule from '../createObjectValidationRule';
import composeValidator from '../composeValidator';
import isObject from '../../rules/isObject';

describe('createTupleValidationRule', () => {
  describe('createTupleValidationRule error cases', () => {
    describe('Simple tuple', () => {
      describe('Error case: invalid element types', () => {
        it('should fail when tuple elements do not match validators', () => {
          // Arrange
          const inputValue = [123, 'not a number'] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
            expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
            expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
            expect(actualResult?.data?.[0]).toBeDefined();
            expect(actualResult?.data?.[1]).toBeDefined();
          }
        });
        it('should fail when input is not an array', () => {
          // Arrange
          const inputValue = 'not an array';
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue as any);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
            expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
            expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
            expect(actualResult?.data?.[0]).toBeDefined();
            expect(actualResult?.data?.[1]).toBeDefined();
          }
        });
      });
    });

    describe('Complex tuple', () => {
      describe('Error case: some elements invalid', () => {
        it('should fail when some tuple elements are invalid', () => {
          // Arrange
          const inputValue = ['Bob', -5, 'not boolean', [1, 2, 3]] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber, isPositiveNumber]]),
            composeValidator([[isBoolean]]),
            composeValidator([[isArray]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
            expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(`2${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(IS_ONLY_POSITIVE_NUMBER_ERROR_MESSAGE);
            expect(actualResult?.data?.[0]).toBeUndefined();
            expect(actualResult?.data?.[1]).toBeDefined();
            expect(actualResult?.data?.[2]).toBeDefined();
            expect(actualResult?.data?.[3]).toBeUndefined();
          }
        });
      });
    });

    describe('Optional element', () => {
      describe('Error case: not string or undefined', () => {
        it('should fail when tuple element is not string or undefined', () => {
          // Arrange
          const inputValue = ['a', 123] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString], [isUndefined]]),
            composeValidator([[isString], [isUndefined]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
            expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult?.data?.[1]).toBeDefined();
          }
        });
      });
    });

    describe('Single element tuple', () => {
      describe('Error case: single element invalid', () => {
        it('should fail when single element is invalid', () => {
          // Arrange
          const inputValue = [123] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
            expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
            expect(actualResult?.data?.[0]).toBeDefined();
          }
        });
      });
    });

    describe('Mixed validation', () => {
      describe('Error case: all elements invalid', () => {
        it('should handle tuple with all invalid elements', () => {
          // Arrange
          const inputValue = [null, 'not a number'] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${DEFAULT_ERROR_MESSAGE_HYPERNYM_SEPARATOR}`);
            expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult?.data?.[0]).toBeDefined();
            expect(actualResult?.data?.[1]).toBeDefined();
          }
        });
      });
    });

    describe('Params', () => {
      const stringValidator = composeValidator([[isString]]);
      const numberValidator = composeValidator([[isNumber]]);
      const validators = [stringValidator, numberValidator] as const;

      describe('proxyPerElement', () => {
        it('should call proxyPerElement for each element with mixed results', () => {
          // Arrange
          const inputValue = [123, 'not a number'] as const;
          const proxiedResults: Array<{ result: any; index: number }> = [];
          const tupleValidationRule = createTupleValidationRule(
            [...validators],
            {
              proxyPerElement: (result: any, index: number) => {
                proxiedResults.push({ result, index });
              },
            },
          );

          // Act
          tupleValidationRule(inputValue);

          // Assert
          expect(proxiedResults).toHaveLength(2);
          expect(proxiedResults[0].result.status).toBe('error');
          expect(proxiedResults[1].result.status).toBe('error');
        });
      });

      describe('errorMessageHypernym', () => {
        it('should use custom error message hypernym', () => {
          // Arrange
          const inputValue = [123, 'not a number'] as const;
          const customHypernym = 'Custom tuple error';
          const tupleValidationRule = createTupleValidationRule(
            [...validators],
            { errorMessageHypernym: customHypernym },
          );

          // Act
          const actualResult = tupleValidationRule(inputValue);

          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(customHypernym);
            expect(actualResult.message).not.toContain(DEFAULT_ERROR_MESSAGE_HYPERNYM);
          }
        });
      });

      describe('errorMessageHypernymSeparator', () => {
        it('should use custom hypernym separator', () => {
          // Arrange
          const inputValue = [123, 'not a number'] as const;
          const customSeparator = ' ->';
          const tupleValidationRule = createTupleValidationRule(
            [...validators],
            { errorMessageHypernymSeparator: customSeparator },
          );

          // Act
          const actualResult = tupleValidationRule(inputValue);

          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`${DEFAULT_ERROR_MESSAGE_HYPERNYM}${customSeparator}`);
          }
        });
      });

      describe('errorMessageIndexSeparator', () => {
        it('should use custom index separator', () => {
          // Arrange
          const inputValue = [123, 'not a number'] as const;
          const customSeparator = ' => ';
          const tupleValidationRule = createTupleValidationRule(
            [...validators],
            { errorMessageIndexSeparator: customSeparator },
          );

          // Act
          const actualResult = tupleValidationRule(inputValue);

          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`0${customSeparator}`);
            expect(actualResult.message).toContain(`1${customSeparator}`);
          }
        });
      });
    });

    describe('Edge cases', () => {
      describe('Error case: error message formatting', () => {
        it('should format error messages with element indices', () => {
          // Arrange
          const inputValue = [123, 'invalid', false] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber]]),
            composeValidator([[isBoolean]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(actualResult.message).toContain(`0${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(`1${DEFAULT_ERROR_MESSAGE_INDEX_SEPARATOR}`);
            expect(actualResult.message).toContain(IS_STRING_ERROR_MESSAGE);
            expect(actualResult.message).toContain(IS_NUMBER_ERROR_MESSAGE);
            expect(actualResult.message).toContain(' ');
          }
        });
      });
      describe('Type case: OR logic and structure', () => {
        it('should have correct error structure for tuple validation with OR logic', () => {
          // Arrange
          const workplaceSchema = {
            position: composeValidator([[isString, isOnlyEnglishLettersString]]),
            company: composeValidator([[isString, isOnlyEnglishLettersString]]),
          };
          const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
          const workplaceValidator = composeValidator([[isObject, workplaceValidationRule]]);
          const tupleValidationRule = createTupleValidationRule([workplaceValidator]);
          const inputValue = [[{ position: '1', company: 'w' }]];
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('error');
          if (actualResult.status === 'error') {
            expect(Array.isArray(actualResult.data)).toBe(true);
            expect(actualResult.data).toHaveLength(1);
            const firstElementError = actualResult.data?.[0];
            expect(firstElementError).toBeDefined();
            if (firstElementError && typeof firstElementError === 'object' && 'status' in firstElementError) {
              const elementError = firstElementError as any;
              expect(elementError.status).toBe('error');
              if (elementError.status === 'error') {
                expect(typeof elementError.message).toBe('string');
                expect(typeof elementError.data).toBe('object');
                expect(elementError.data).not.toBeNull();
              }
            }
          }
        });
      });
    });
  });

  describe('createTupleValidationRule success cases', () => {
    describe('Simple tuple', () => {
      describe('Success case: string and number', () => {
        it('should validate tuple with string and number', () => {
          // Arrange
          const inputValue = ['Hello', 42] as const;
          const expectedData = ['Hello', 42];
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber]]),
          ]);
          // Act
          const actualResult = tupleValidationRule(inputValue);
          // Assert
          expect(actualResult.status).toBe('success');
          if (actualResult.status === 'success') {
            expect(actualResult.data).toEqual(expectedData);
          }
        });
      });
    });

    describe('Complex tuple', () => {
      describe('Success case: multiple types', () => {
      it('should validate tuple with multiple types', () => {
        // Arrange
        const inputValue = ['Alice', 30, true, [1, 2, 3]] as const;
        const expectedData = ['Alice', 30, true, [1, 2, 3]];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([[isString]]),
          composeValidator([[isNumber, isPositiveNumber]]),
          composeValidator([[isBoolean]]),
          composeValidator([[isArray]]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
  });

    describe('Optional element', () => {
      describe('Success case: string or undefined', () => {
      it('should validate tuple with string or undefined', () => {
        // Arrange
        const inputValue = ['a', undefined] as const;
        const expectedData = ['a', undefined];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([[isString], [isUndefined]]),
          composeValidator([[isString], [isUndefined]]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
  });

    describe('Single element tuple', () => {
      describe('Success case: single element', () => {
      it('should validate tuple with single element', () => {
        // Arrange
        const inputValue = ['Single'] as const;
        const expectedData = ['Single'];
        const tupleValidationRule = createTupleValidationRule([
          composeValidator([[isString]]),
        ]);
        // Act
        const actualResult = tupleValidationRule(inputValue);
        // Assert
        expect(actualResult.status).toBe('success');
        if (actualResult.status === 'success') {
          expect(actualResult.data).toEqual(expectedData);
        }
      });
    });
  });

    describe('Mixed validation', () => {
      describe('Error case: mixed valid and invalid elements', () => {
        it('should handle tuple with mixed valid and invalid elements', () => {
          // Arrange
          const inputValue = ['valid', 'not number', true] as const;
          const tupleValidationRule = createTupleValidationRule([
            composeValidator([[isString]]),
            composeValidator([[isNumber]]),
            composeValidator([[isBoolean]]),
          ]);
          // Act
          const validResult = tupleValidationRule(['valid', 123, true] as const);
          const invalidResult = tupleValidationRule(inputValue);
          // Assert
          expect(validResult.status).toBe('success');
          expect(invalidResult.status).toBe('error');
        });
      });
    });

    describe('Params', () => {
      const stringValidator = composeValidator([[isString]]);
      const numberValidator = composeValidator([[isNumber]]);
      const validators = [stringValidator, numberValidator] as const;

      describe('proxyPerElement', () => {
        it('should call proxyPerElement for each element with success results', () => {
          // Arrange
          const inputValue = ['Hello', 42] as const;
          const proxiedResults: Array<{ result: any; index: number }> = [];
          const tupleValidationRule = createTupleValidationRule(
            [...validators],
            {
              proxyPerElement: (result: any, index: number) => {
                proxiedResults.push({ result, index });
              },
            },
          );

          // Act
          tupleValidationRule(inputValue);

          // Assert
          expect(proxiedResults).toHaveLength(2);
          expect(proxiedResults[0].index).toBe(0);
          expect(proxiedResults[1].index).toBe(1);
          proxiedResults.forEach(({ result }) => {
            expect(result.status).toBe('success');
          });
        });
    });
  });

    describe('Edge cases', () => {
      describe('Type case: OR logic and structure', () => {
        it('should have correct success structure for tuple validation', () => {
          // Arrange
          const workplaceSchema = {
            position: composeValidator([[isString, isOnlyEnglishLettersString]]),
            company: composeValidator([[isString, isOnlyEnglishLettersString]]),
          };
          const workplaceValidationRule = createObjectValidationRule(workplaceSchema);
          const workplaceValidator = composeValidator([[isObject, workplaceValidationRule]]);
          const tupleValidationRule = createTupleValidationRule([workplaceValidator]);
          const tupleValidator = composeValidator([[isArray, tupleValidationRule], [isUndefined]]);
          const inputValue = [{ position: 'Manager', company: 'TechCorp' }] as const;
          // Act
          const actualResult = tupleValidator(inputValue);
          // Assert
          expect(actualResult.status).toBe('success');
          if (actualResult.status === 'success') {
            expect(Array.isArray(actualResult.data)).toBe(true);
            expect(actualResult.data).toHaveLength(1);
            expect(actualResult?.data?.[0]).toEqual({ position: 'Manager', company: 'TechCorp' });
          }
        });
      });
    });
  });
});

/* eslint-disable max-len */
import {
  TRetrieveErrorData,
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidator,
} from '../types/TValidator';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import isArray, { TIsArrayValidationError } from '../validators/isArray';

export type TInputValue<Validators extends Array<TValidator>> = Validators extends [infer First extends TValidator, ...infer Rest extends Array<TValidator>]
  ? [TRetrieveValidationInputData<First>, ...TInputValue<Rest>]
  : [];

export type TSuccessValidationData<Validators extends Array<TValidator>> = Validators extends [infer First extends TValidator, ...infer Rest extends Array<TValidator>]
  ? [TRetrieveValidationSuccessData<First>['data'], ...TSuccessValidationData<Rest>]
  : [];

export type TErrorValidationData<Validators extends Array<TValidator>> = Validators extends [infer First extends TValidator, ...infer Rest extends Array<TValidator>]
  ? [TRetrieveErrorData<First> | undefined, ...TSuccessValidationData<Rest>]
  : never;

type TValidationAccumulator<Validators extends Array<TValidator>> = {
  validResults: TSuccessValidationData<Validators>;
  errors: TErrorValidationData<Validators>;
  errorMessages: string[];
  isError: boolean;
};

export default function createTupleValidationRule<const Validators extends Array<TValidator>>(validators: Validators) {
  return <const Values extends TInputValue<Validators>>(value: Values):
  ISuccess<TSuccessValidationData<Validators>>
  | IError<string, TErrorValidationData<Validators>>
  | TIsArrayValidationError => {
    try {
      const arrayValidation = isArray(value);
      if (arrayValidation.status === 'error') {
        return arrayValidation;
      }

      const initialAcc: TValidationAccumulator<Validators> = {
        validResults: [] as unknown as TSuccessValidationData<Validators>,
        errors: [] as unknown as TErrorValidationData<Validators>,
        errorMessages: [],
        isError: false,
      };

      const result = validators.reduce((acc, validator, index) => {
        const validationResult = validator(value[index]);

        if (validationResult.status === 'success') {
          acc.validResults[index] = validationResult.data;
          acc.errors[index] = undefined;
        } else {
          acc.isError = true;
          acc.errors[index] = validationResult;
          acc.errorMessages.push(`${index}: ${validationResult.message}`);
        }
        return acc;
      }, initialAcc);

      if (result.isError) {
        return new ErrorResult(
          `Tuple validation failed for the following elements:\n${result.errorMessages.join('\n')}`,
          result.errors,
        );
      }

      return new SuccessResult(result.validResults);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

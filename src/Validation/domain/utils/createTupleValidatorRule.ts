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

export type TInputValue<Validators extends Array<TValidator>> = Validators extends [infer First extends TValidator, ...infer Rest extends Array<TValidator>]
  ? [TRetrieveValidationInputData<First>, ...TInputValue<Rest>]
  : [];

export type TSuccessValidationData<Validators extends Array<TValidator>> = Validators extends [infer First extends TValidator, ...infer Rest extends Array<TValidator>]
  ? [TRetrieveValidationSuccessData<First>['data'], ...TSuccessValidationData<Rest>]
  : [];

export type TErrorValidationData<Validators extends Array<TValidator>> = Validators extends [infer First extends TValidator, ...infer Rest extends Array<TValidator>]
  ? [TRetrieveErrorData<First> | undefined, ...TSuccessValidationData<Rest>]
  : never;

export default function createTupleValidatorRule<const Validators extends Array<TValidator>>(validators: Validators) {
  return <const Values extends TInputValue<Validators>>(values: Values):
  ISuccess<TSuccessValidationData<Validators>>
  | IError<string, TErrorValidationData<Validators>> => {
    try {
      let isError = false;
      let overallErrorMessage = '';
      const errors = [] as unknown as TErrorValidationData<Validators>;
      const resultArr = validators.map((validator, index) => {
        const validationResult = validator(values[index]);
        if (validationResult.status === 'success') {
          if (validationResult.data) {
            errors.push(undefined);
            return validationResult.data;
          }
        } else if (validationResult.status === 'error') {
          isError = true;
          errors.push(validationResult as TErrorValidationData<Validators>[number]);
          overallErrorMessage = `${overallErrorMessage}
             ${index}: ${validationResult?.message}`;
          return undefined;
        }
      });
      if (isError) {
        return new ErrorResult(`Array validation failed for the following elements: ${overallErrorMessage}`, errors) as IError<string, TErrorValidationData<Validators>>;
      }
      return new SuccessResult(resultArr as TSuccessValidationData<Validators>);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

import {
  TRetrieveValidationInputData,
  TRetrieveValidationSuccessData,
  TValidator,
} from '../types/TValidator';
import { TRetrieveError } from '../../../_Root/domain/types/Result/TResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import SuccessResult from '../../../_Root/domain/factories/SuccessResult';

type TInputValue<Validator extends TValidator> = Array<TRetrieveValidationInputData<Validator>>;

export default function createArrayValidatorRule<const Validator extends TValidator>(validator: Validator) {
  return <const Values extends TInputValue<Validator>>(value: Values):
  ISuccess<Array<TRetrieveValidationSuccessData<Validator>>>
  | IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>> => {
    try {
      let isError = false;
      let overallErrorMessage = '';
      const errors = [] as Array<TRetrieveError<ReturnType<Validator>> | undefined>;
      const resultArr = value.map((value, index) => {
        const validationResult = validator(value);
        if (validationResult.status === 'success') {
          if (validationResult.data) {
            errors.push(undefined);
            return validationResult.data;
          }
        } else if (validationResult.status === 'error') {
          isError = true;
          errors.push(validationResult as TRetrieveError<ReturnType<Validator>>);
          overallErrorMessage = `${overallErrorMessage}
             ${index}: ${validationResult?.message}`;
          return undefined;
        }
      });
      if (isError) {
        return new ErrorResult(`Array validation failed for the following elements: ${overallErrorMessage}`, errors) as IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>;
      }
      return new SuccessResult(resultArr as Array<TRetrieveValidationSuccessData<Validator>>);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

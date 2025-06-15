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
import isArray, { TIsArrayValidationError } from '../validators/isArray';

type TInputValue<Validator extends TValidator> = Array<TRetrieveValidationInputData<Validator>>;

type TValidationAccumulator<Validator extends TValidator> = {
  validResults: Array<TRetrieveValidationSuccessData<Validator>>;
  errors: Array<TRetrieveError<ReturnType<Validator>> | undefined>;
  errorMessages: string[];
  isError: boolean;
};


export default function createArrayValidationRule<const Validator extends TValidator>(validator: Validator) {
  return <const Values extends TInputValue<Validator>>(value: Values):
  ISuccess<Array<TRetrieveValidationSuccessData<Validator>>>
  | IError<string, Array<TRetrieveError<ReturnType<Validator>> | undefined>>
  | TIsArrayValidationError => {
    try {
      // Проверка на массив в рантайме
      const arrayValidation = isArray(value);
      if (arrayValidation.status === 'error') {
        return arrayValidation;
      }

      const initialAcc: TValidationAccumulator<Validator> = {
        validResults: [],
        errors: [],
        errorMessages: [],
        isError: false,
      };

      const result = value.reduce((acc, item, index) => {
        const validationResult = validator(item);
        if (validationResult.status === 'success') {
          acc.validResults.push(validationResult.data);
          acc.errors.push(undefined);
        } else {
          acc.isError = true;
          acc.errors.push(validationResult as TRetrieveError<ReturnType<Validator>>);
          acc.errorMessages.push(`${index}: ${validationResult.message}`);
        }
        return acc;
      }, initialAcc);

      if (result.isError) {
        return new ErrorResult(
          `Array validation failed for the following elements:\n${result.errorMessages.join('\n')}`,
          result.errors
        );
      }

      return new SuccessResult(result.validResults);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

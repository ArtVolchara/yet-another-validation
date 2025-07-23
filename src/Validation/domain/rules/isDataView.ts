import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';

export const IS_DATA_VIEW_ERROR_MESSAGE = 'Value should be a DataView' as const;

export type TIsDataViewValidationError = IError<typeof IS_DATA_VIEW_ERROR_MESSAGE, undefined>;
export type TIsDataViewValidationSuccess = ISuccess<DataView>;

export default function isDataView(value: any): TIsDataViewValidationSuccess | TIsDataViewValidationError {
  try {
    if (value instanceof DataView) {
      return new SuccessResult(value as DataView);
    }

    return new ErrorResult(IS_DATA_VIEW_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_DATA_VIEW_ERROR_MESSAGE, undefined);
  }
} 
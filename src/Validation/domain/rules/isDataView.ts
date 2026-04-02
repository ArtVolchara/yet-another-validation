import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';
import { ISuccess } from '../../../_Root/domain/types/Result/ISuccess';
import { IError } from '../../../_Root/domain/types/Result/IError';
import type { TValidationParams } from '../types/TValidator';

export const IS_DATA_VIEW_ERROR_MESSAGE = 'Value should be a DataView' as const;

export type TIsDataViewValidationError = IError<typeof IS_DATA_VIEW_ERROR_MESSAGE, undefined>;
export type TIsDataViewValidationSuccess = ISuccess<DataView>;

type TIsDataViewValidationResult<Params extends TValidationParams | undefined = undefined> =
  [NonNullable<Params>['shouldReturnError']] extends [never]
    ? TIsDataViewValidationSuccess | TIsDataViewValidationError
    : [NonNullable<Params>['shouldReturnError']] extends [true]
      ? TIsDataViewValidationError
      : TIsDataViewValidationSuccess | TIsDataViewValidationError;

export default function isDataView<const Params extends TValidationParams | undefined = undefined>(
  value: any,
  params?: Params,
): TIsDataViewValidationResult<Params> {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_DATA_VIEW_ERROR_MESSAGE, undefined) as TIsDataViewValidationResult<Params>;
  }
  try {
    if (value instanceof DataView) {
      return new SuccessResult(value) as TIsDataViewValidationResult<Params>;
    }
    return new ErrorResult(IS_DATA_VIEW_ERROR_MESSAGE, undefined) as TIsDataViewValidationResult<Params>;
  } catch (e) {
    console.error(e);
    return new ErrorResult(IS_DATA_VIEW_ERROR_MESSAGE, undefined) as TIsDataViewValidationResult<Params>;
  }
}

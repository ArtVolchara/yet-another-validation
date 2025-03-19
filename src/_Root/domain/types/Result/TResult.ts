import { IError } from './IError';
import { ISuccess } from './ISuccess';

export type TResultStatus = 'success' | 'error';

export interface IResultType {
  status: TResultStatus
};

export type TResult<Success extends ISuccess, Error extends IError<string, any> = IError<string, any>> = Success | Error;
export type TRetrieveSuccess<Result extends TResult<ISuccess, IError<string, any>>> = Extract<Result, ISuccess>;
export type TRetrieveError<Result extends TResult<ISuccess, IError<string, any>>> = Extract<Result, IError<string, any>>

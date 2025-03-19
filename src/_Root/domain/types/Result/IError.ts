import { IResultType } from './TResult';

export interface IError<Message extends string = string, Data extends any = undefined> extends IResultType {
  status: 'error',
  message: Message,
  data: Data
}

export function isInternalError(e: any): e is IError {
  return e?.status === 'error' && typeof e?.message === 'string';
}

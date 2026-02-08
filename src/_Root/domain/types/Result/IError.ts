export type TErrorStatus = 'error';

export interface IError<Message extends string = string, Data extends any = undefined> {
  status: TErrorStatus,
  message: Message,
  data: Data
}

export function isInternalError(e: any): e is IError {
  return e?.status === 'error' && typeof e?.message === 'string';
}

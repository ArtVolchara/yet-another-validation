export type TErrorStatus = 'error';

export interface IError<Message extends string = string, Errors extends any = undefined> {
  status: TErrorStatus,
  message: Message,
  errors: Errors,
}

export function isInternalError(e: any): e is IError {
  return e?.status === 'error' && typeof e?.message === 'string';
}

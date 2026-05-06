import { IError } from '../types/Result/IError';

export default class ErrorResult<const Message extends string, const Errors extends any = undefined> implements IError<Message, Errors> {
  status: IError<Message, Errors>['status'] = 'error';

  message: IError<Message, Errors>['message'];

  errors: Errors;

  constructor(message: Message, errors: Errors) {
    this.message = message;
    this.errors = errors;
  }
}

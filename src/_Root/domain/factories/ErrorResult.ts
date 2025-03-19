import { IError } from '../types/Result/IError';

export default class ErrorResult<const Message extends string, const Data extends any = undefined> implements IError<Message, Data> {
  status: IError<Message, Data>['status'] = 'error';

  message: IError<Message, Data>['message'];

  data: Data;

  constructor(message: Message, data: Data) {
    this.message = message;
    this.data = data;
  }
}

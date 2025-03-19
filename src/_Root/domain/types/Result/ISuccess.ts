import { IResultType } from './TResult';

export interface ISuccess<Data extends any = any> extends IResultType {
  status: 'success',
  data: Data
}

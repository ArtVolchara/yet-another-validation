import { ISuccess } from '../types/Result/ISuccess';

export default class SuccessResult<Data extends any = any> implements ISuccess<Data> {
  status: ISuccess<Data>['status'] = 'success';

  data: Data;

  constructor(data: Data) {
    this.data = data;
  }
}

import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export default function isString(value: string) {
  try {
    if (typeof value === 'string') {
      return new SuccessResult(value);
    }
    return new ErrorResult('Value should be string', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('Value should be string', undefined);
  }
}
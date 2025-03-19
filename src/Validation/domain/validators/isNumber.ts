import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export default function isNumber(value: number) {
  try {
    if (typeof value === 'number') {
      return new SuccessResult(value);
    }
    return new ErrorResult('Value should be number', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('Value should be number', undefined);
  }
}

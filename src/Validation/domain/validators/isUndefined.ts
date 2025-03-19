import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export default function isUndefined(value: undefined) {
  try {
    if (typeof value === 'undefined') {
      return new SuccessResult(value);
    }
    return new ErrorResult('Value should be undefined', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('Value should be undefined', undefined);
  }
}
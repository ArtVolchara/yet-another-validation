import SuccessResult from '../../../_Root/domain/factories/SuccessResult';
import ErrorResult from '../../../_Root/domain/factories/ErrorResult';

export default function isBoolean(value: boolean) {
  try {
    if (typeof value === 'boolean') {
      return new SuccessResult(value);
    }
    return new ErrorResult('Value should be boolean', undefined);
  } catch (e) {
    console.error(e);
    return new ErrorResult('Value should be boolean', undefined);
  }
}
import { ISuccess } from 'src/_Root/domain/types/Result/ISuccess';
import { IError } from 'src/_Root/domain/types/Result/IError';
import { TResult } from 'src/_Root/domain/types/Result/TResult';

function customErrorDecorator<
  const RuleOrValidator extends (value: any) => ISuccess<any> | IError<string, any>,
  const CustomError extends IError<string, any>,
>(
  validationRule: RuleOrValidator,
  error: CustomError,
): (value: Parameters<RuleOrValidator>[0]) => TResult<
Extract<ReturnType<RuleOrValidator>, ISuccess>,
CustomError
>;

function customErrorDecorator<
  const RuleOrValidator extends (value: any) => ISuccess<any> | IError<string, any>,
  const ErrorFactory extends (data: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => IError<string, any>,
>(
  validationRule: RuleOrValidator,
  factory: ErrorFactory,
): (value: Parameters<RuleOrValidator>[0]) => TResult<
Extract<ReturnType<RuleOrValidator>, ISuccess>,
ReturnType<ErrorFactory>
>;

function customErrorDecorator<
  const RuleOrValidator extends (value: any) => ISuccess<any> | IError<string, any>,
  const ErrorOrFactory extends IError<string, any>
  | ((data: Extract<ReturnType<RuleOrValidator>, IError<string, any>>) => IError<string, any>),
>(
  ruleOrValidator: (...args: any[]) => any,
  errorOrFactory: ErrorOrFactory,
) {
  return (...args: Parameters<RuleOrValidator>) => {
    const res = ruleOrValidator(...args)
    if (res.status === 'error') {
      const error = typeof errorOrFactory === 'function'
        ? errorOrFactory(res)
        : errorOrFactory;
      return error;
    }
    return res;
  };
}

export default customErrorDecorator;

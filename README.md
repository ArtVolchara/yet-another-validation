# YET-ANOTHER-VALIDATION

## 📋 Содержание

1. [🧭 Обзор](#🧭-обзор)
2. [🧩 Основные концепции и понятия](#🧩-основные-концепции-и-понятия)
3. [📦 Импорт](#📦-импорт)

---

## 🧭 Обзор

YET-ANOTHER-VALIDATION - мой собственный пример декларативной валидации в функциональном стиле на Typescript. Зачем нужна ещё одна библиотека валидации, когда есть масса прекрасных библиотек типа yup, joi и т.д.? YET-ANOTHER-VALIDATION задумывалась не как библиотека или npm-пакет, а как копируемая и контролируемая директория в доменный слой проектов, воплощающих идеи Чистой Архитектуры и Domain Driven Design. Проектов, где использование внешних библиотек в доменном слое недопустимо, а необходимость валидации именно там присутствует.  

Тесты и документация написаны с помощью Cursor AI

Основные особенности:
- **Декларативность** - Опиши желаемый результат<br/>
- **Функциональный подход** - Чистые функции в качестве валидационных правил <br/>
- **Композируемость** - Pipe-утилита для композирования валидаторов и валидационных правил<br/>
- **AND/OR** - Используйте операцию AND для проверки всех критериев одновременно и OR для проверки хотя бы одного<br/>
- **Типобезопасность** - Подробный вывод типов удачной и неудачной валидации. Использование номинальных типов<br/>
- **Гибкость** - Используйте готовые или создавайте собственные валидационные правила<br/>

## Основные концепции и понятия

### Result-Pattern
В Yet-Another-Validation используется Result-паттерн как тип возвращаемого значения любого валидатора или валидационного правила:
```typescript

// Успешный результат
interface ISuccess<Data extends any = any> {
  status: 'success';
  data: T;
}

// Ошибка валидации
interface IError<Message extends string = string, Data extends any = undefined> {
  status: 'error';
  message: Message;
  data: Data;
}
```

### Валидационное правило (Validation Rule)
Валидационное правило (validation rule) - атомарная функция, валидирующая переданное значение и обязательно должна возвращать только ISuccess<ожидаемый тип> | IError<'текст ошибки', undefined>. 
```typescript
type TValidationRule<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends IError<string, any> = IError<string, any>,
> = <Input extends InputData = InputData>(value: Input) => TResult<Success, Error>
```
Вот к примеру валидационное правило, проверяющее является ли переданное значение числом:
```typescript
function isNumber(value: any): ISuccess<number> | IError<'Value should be number', undefined> {
  try {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return new SuccessResult(value) // SuccessResult - класс-конструктор для ISuccess;
    }
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined)  // ErrorResult - класс-конструктор для  IError;
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_NUMBER_ERROR_MESSAGE, undefined);
  }
}
```
Такие атомарные валидационные правила подразумевается использовать в:

### `validateValueFromRules(value, ...rules)`
Функция, валидирующая переданное value по списку атомарных валидационных правил rules.
Проверяет, что валидируемое значение соответствует правилу 1 И правилу 2. Работает по примеру pipe-оператора - в процессе исполнения каждое последующее валидационное правило в качестве параметра будет принимать результат предыдущего правила для проверки.
Успешный результат валидации цепочки, например из двух правил, будет иметь пересечение (&) типов успеха всех правил цепочки.
В свою очередь результирующая ошибка валидации будет иметь либо только сообщение последнего валидационного правила, либо обоих, разделённых точкой и пробелом. В data будет лежать соответствующий массив ошибок валидационных правил.
```typescript
type TValidationRule<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends IError<string, any> = IError<string, any>,
> = <Input extends InputData = InputData>(value: Input) => TResult<Success, Error>;
```
**Параметры:**
| Параметр | Описание |
|----------|----------|
| value    | Валидируемое значение |
| rules    | Валидационные правила |

**Возвращает:**
TResult<Success, Error> - результат валидации

**Пример:**
```typescript
const actualResult = validateValueFromRules('abc', isString, isOnlyEnglishLettersString);
/*const actualResult: ISuccess<string & TOnlyEnglishLettersNominal> | IError<"Value should contain only English letters" | "Value should be string. Value should contain only English letters", [TIsOnlyEnglishLettersStringValidationError] | [TIsStringValidationError, TIsOnlyEnglishLettersStringValidationError]>*/
```

> **💡 Совет:**
Не следует каждый раз при создании новых частных правил валидации, например строки, включать проверку на string. Лучше укажите тип параметра как string. При композицировании typescript потребует, чтобы перед этим правилом в цепочку правил было вставлено правило, проверяющее на string.

> **🔴 Ограничение:**
Следите, чтобы тип параметра каждого последующего валидационного правила, переданного в validateValueFromRules, был логически совместим с типом возвращаемого значения предыдущего правила. В случае, когда тип параметра валидационного правила к примеру "any", вы можете случайно поместить это правило в середину цепочки правил, т.к. тип-пересечение возвращаемых значений предыдущих правил будет в любом случае совместим с типом "any". Таким образом вызов validateValueFromRules с этим набором правил в runtime всегда будет возвращать ErrorResult. 
Обратите внимание на код ниже, иллюстрирующий ещё один аспект этой проблемы - внутри ISuccess в первом случае мы увидим never, как невозможное пересечение string и number типов:
```typescript
import isString from '@validation/rules/isString';
import isNumber from '@validation/rules/isNumber';
import validateValueFromRules from '@validation/functions/validateValueFromRules';

const actualResult = validateValueFromRules('abc', isString, isNumber);
/*const actualResult: ISuccess<never> | IError<...>*/
``` 
А во втором случае мы получим string & any[], т.к. typescript допускает пересечение примитивного и непримитивного типов (в частности для поддержки номинальной типизации):
```typescript
import isString from '@validation/rules/isString';
import isArray from '@validation/rules/isArray';
import validateValueFromRules from '@validation/functions/validateValueFromRules';

const actualResult = validateValueFromRules('abc', isString, isArray);
/*const actualResult: ISuccess<string & any[]> | IError<...>*/
``` 
**🟡 Важно:**
Валидационные правила будут вызываться последовательно все, даже если в первом из них была обнаружена ошибка валидации. Поэтому каждое правило должно быть готово вне зависимости от типа аргумента обработать любое значение из рантайма и для этого иметь catch внутри себя, в котором возвращается (не выбрасывается) IError c нужным сообщением об ошибке.

Также валидационные правила можно использовать в 
### `validateValue(value, ...validators)`
Функция, проверяет значение value по принципу "ИЛИ". То есть соответствует ли value списку правил 1 (или валидатору) ИЛИ списку правил 2 (или валидатору).
Успешный результат валидации будет иметь вид объединения (union, ||) пересечений валидационных правил (или валидатора/ов).
Ошибка валидации будет иметь сообщение из сообщений валидационных правил (или валидатора/ов), разделённых союзом OR, а в data будет лежать список, элементами которого будет data из валидаторов и списки ошибок на каждую цепочку валидационных правил.<br/>
**Параметры:**<br/>
| Параметр | Описание |
|---|---|
| value | Значение для валидации |
| validators | Валидаторы или списки валидационных правил |

**Возвращает:**
TResult<Success, Error> - результат валидации

**Пример:**<br/>
```typescript
import isString from '@validation/rules/isString';
import isOnlyEnglishLettersString from '@validation/rules/isOnlyEnglishLettersString';
import isNumber from '@validation/rules/isNumber';
import isPositiveNumber from '@validation/rules/isPositiveNumber';
import validateValue from '@validation/functions/validateValue';

const actualResult = validateValue(
  inputValue,
  [isString, isOnlyEnglishLettersString], // AND группа 1
  [isNumber, isPositiveNumber], // Валидатор 1
);
//const actualResult: ISuccess<(string & TOnlyEnglishLettersNominal) | (number & TPositiveNumberNominal)> | 
//  IError<
//    "Value should contain only English letters OR Value should be positive number" | 
//    "Value should contain only English letters OR Value should be number. Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be number. Value should be positive number", 
//    [
//      [TIsOnlyEnglishLettersStringValidationError] | [TIsStringValidationError, TIsOnlyEnglishLettersStringValidationError], 
//      [TIsPositiveNumberValidationError] | [TIsNumberValidationError, TIsPositiveNumberValidationError]
//    ]
//  >
```
или
```typescript
import isString from '@validation/rules/isString';
import isOnlyEnglishLettersString from '@validation/rules/isOnlyEnglishLettersString';
import isNumber from '@validation/rules/isNumber';
import isPositiveNumber from '@validation/rules/isPositiveNumber';
import composeValidator from '@validation/factories/composeValidator';
import validateValue from '@validation/functions/validateValue';

const actualResult = validateValue(
  inputValue,
  [isString, isOnlyEnglishLettersString], // AND группа 1
  composeValidator([isNumber, isPositiveNumber]) // Валидатор 1
);
//const actualResult: ISuccess<(string & TOnlyEnglishLettersNominal) | (number & TPositiveNumberNominal)> | 
//  IError<
//    "Value should contain only English letters OR Value should be positive number" | 
//    "Value should contain only English letters OR Value should be number. Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be number. Value should be positive number", 
//    [
//      [TIsOnlyEnglishLettersStringValidationError] | [TIsStringValidationError, TIsOnlyEnglishLettersStringValidationError], 
//      [TIsPositiveNumberValidationError] | [TIsNumberValidationError, TIsPositiveNumberValidationError]
//    ]
//  >
```
### `composeValidator(...validators)`
Фабрика для создания функции-валидатора. Принимает список валидаторов или валидационных правил и возвращает функцию-валидатор, которая при передаче значения value валидирует его с помощью validateValue:
```typescript
type TValidator<
    InputData extends any = any,
    Success extends ISuccess = ISuccess,
    Error extends IError<string, Array<Array<IError<string, any>>>
    > = IError<string, Array<Array<IError<string, any>>>>,
> = <Input extends InputData = InputData>(value: Input) => TResult<Success, Error>
```
Для валидации использует validateValue<br/>
**Параметры:**<br/>
| Параметр | Описание |
|----------|----------|
| validators | Валидаторы или списки валидационных правил |

**Возвращает:**
TValidator<InputData, Success, Error>

**Пример:**<br/>
```typescript
import isString from '@validation/rules/isString';
import isOnlyEnglishLettersString from '@validation/rules/isOnlyEnglishLettersString';
import isNumber from '@validation/rules/isNumber';
import isPositiveNumber from '@validation/rules/isPositiveNumber';
import composeValidator from '@validation/factories/composeValidator';

const validator = composeValidator(
  [isString, isOnlyEnglishLettersString], // AND группа 1
  [isNumber, isPositiveNumber]           // AND группа 2
);
//<const Value extends any>(value: Value) => 
//  ISuccess<(string & TOnlyEnglishLettersNominal) | (number & TPositiveNumberNominal)> | 
//  IError<
//    "Value should contain only English letters OR Value should be positive number" | 
//    "Value should contain only English letters OR Value should be number. Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be number. Value should be positive number",
//    [
//      [TIsOnlyEnglishLettersStringValidationError] | [TIsStringValidationError, TIsOnlyEnglishLettersStringValidationError], 
//      [TIsPositiveNumberValidationError] | [TIsNumberValidationError, TIsPositiveNumberValidationError]
//    ]
//  >
```
или
```typescript
import isString from '@validation/rules/isString';
import isOnlyEnglishLettersString from '@validation/rules/isOnlyEnglishLettersString';
import isNumber from '@validation/rules/isNumber';
import isPositiveNumber from '@validation/rules/isPositiveNumber';
import composeValidator from '@validation/factories/composeValidator';

const validator = composeValidator(
  [isString, isOnlyEnglishLettersString], // AND группа 1
  composeValidator([isNumber, isPositiveNumber]) // Валидатор 1
);
//const validator: <const Value extends any>(value: Value) => 
//  ISuccess<(string & TOnlyEnglishLettersNominal) | (number & TPositiveNumberNominal)> | 
//  IError<
//    "Value should contain only English letters OR Value should be positive number" | 
//    "Value should contain only English letters OR Value should be number. Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be positive number" | 
//    "Value should be string. Value should contain only English letters OR Value should be number. Value should be positive number", 
//    [
//      [TIsOnlyEnglishLettersStringValidationError] | [TIsStringValidationError, TIsOnlyEnglishLettersStringValidationError],
//      [TIsPositiveNumberValidationError] | [TIsNumberValidationError, TIsPositiveNumberValidationError]
//    ]
//  >
```

### `createObjectValidationRule(schema)`
Фабрика для создания правила валидации объекта. Принимает схему объекта с валидаторами для каждого поля и возвращает функцию-валидатор, которая проверяет соответствие переданного объекта заданной схеме.<br/>
**Параметры:**<br/>
| Параметр | Описание |
|----------|----------|
| schema | Объект с валидаторами для каждого поля объекта |

**Возвращает:**
TValidator<object, object, ErrorResult> - функция-валидатор для объекта

**Пример:**<br/>
```typescript
import isString from '@validation/rules/isString';
import isOnlyEnglishLettersString from '@validation/rules/isOnlyEnglishLettersString';
import isNumber from '@validation/rules/isNumber';
import isPositiveNumber from '@validation/rules/isPositiveNumber';
import composeValidator from '@validation/factories/composeValidator';
import createObjectValidationRule from '@validation/factories/createObjectValidationRule';

const userSchema = {
  name: composeValidator([isString, isOnlyEnglishLettersString]),
  age: composeValidator([isNumber, isPositiveNumber]),
};

const userValidationRule = createObjectValidationRule(userSchema);
const result = objectValidationRule({ name: 'John', age: 25 });
//const result: ISuccess<{ name: string, age: number }> | 
// IError<string, {
//   name: IError<"Value should be string", [[TIsStringValidationError]]>;
//   age: IError<"Value should be number", [[TIsNumberValidationError]]>;
// }> |
//  TIsObjectValidationError
```
Если поле опциональное , то вы можете передать в composeValidator соответствующее правило
```typescript
const optionalFiledSchema = {
  optionalField: composeValidator([isString], [isUndefined]),
};
const objectValidationRule = createObjectValidationRule(optionalFiledSchema);
const result = objectValidationRule({ optionalField: undefined });
//const result: ISuccess<{ optionalField: string | undefined }> | 
// IError<
//   string, 
// {
//   optionalField: IError<
//     "Value should be string OR Value should be undefined", 
//     [[TIsStringValidationError], [TIsUndefinedValidationError]]
//   >;
// }>
```

### `createArrayValidationRule(validator)`
Фабрика для создания правила валидации массива. Принимает валидатор для элементов массива и возвращает функцию-валидатор, которая проверяет, что переданное значение является массивом и все его элементы соответствуют заданному валидатору.<br/>
**Параметры:**<br/>
| Параметр | Описание |
|----------|----------|
| validator | Валидатор для элементов массива |

**Возвращает:**
TValidator<Array<any>, Array<any>, ErrorResult> - функция-валидатор для массива

**Пример:**<br/>
```typescript
import isString from '@validation/rules/isString';
import composeValidator from '@validation/factories/composeValidator';
import createArrayValidationRule from '@validation/factories/createArrayValidationRule';

const stringArrayValidationRule = createArrayValidationRule(
  composeValidator([isString])
);
const result = stringArrayValidationRule(['Hello', 'World', 'Test'])
//const result:  ISuccess<ISuccess<string>[]> | 
// IError<string, (IError<"Value should be string", [[TIsStringValidationError]]> | undefined)[]> |
// TIsArrayValidationError
```

### `createTupleValidationRule(validators)`
Фабрика для создания правила валидации кортежа (tuple). Принимает массив валидаторов для каждого элемента кортежа и возвращает функцию-валидатор, которая проверяет, что переданное значение является массивом с фиксированной длиной и каждый элемент соответствует своему валидатору.<br/>
**Параметры:**<br/>
| Параметр | Описание |
|----------|----------|
| validators | Массив валидаторов для каждого элемента кортежа |

**Возвращает:**
TValidator<Tuple, Tuple, ErrorResult> - функция-валидатор для кортежа, где Tuple — кортеж с конкретными типами элементов

**Пример:**<br/>
```typescript
import isString from '@validation/rules/isString';
import isNumber from '@validation/rules/isNumber';
import composeValidator from '@validation/factories/composeValidator';
import createTupleValidationRule from '@validation/factories/createTupleValidationRule';

const tupleValidationRule = createTupleValidationRule([
  composeValidator([isString]),
  composeValidator([isNumber])
]);
// Использование
const result = tupleValidationRule(['hello', 42]);
//const result: ISuccess<[string, number]> | 
//  IError<
//    string, 
//    [
//      IError<"Value should be string", [[TIsStringValidationError]]> | undefined, 
//      IError<"Value should be number", [[TIsNumberValidationError]]> | undefined
//    ]
//  > |
// TIsArrayValidationError

```
### 📦 Импорт
```typescript
// Импорт всех основных компонентов из корневого модуля
import { isString, composeValidator, validateValue, SuccessResult, ErrorResult } from '@validation';

// Или точечный импорт из конкретных модулей
import { isString } from '@validation/rules';
import { composeValidator } from '@validation/factories';
import { validateValue } from '@validation/functions';
import { SuccessResult, ErrorResult } from '@validation/utils'; 
```

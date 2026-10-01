# Yet-Another-Validation

Декларативная валидация на TypeScript. Библиотека задумана как копируемая директория доменного слоя, а не как внешняя зависимость: в проектах с чистой архитектурой и DDD валидация нужна внутри домена, а чужие пакеты туда тащить нельзя. Идея близка к [declarative rule-based validation](https://bespoyasov.ru/blog/declarative-rule-based-validation/).

Правило — чистая функция. Несколько правил соединяются в цепочку «все должны пройти» (AND). Несколько таких цепочек соединяются как «достаточно одной» (OR). TypeScript выводит и успешные данные, и текст ошибки.

## Содержание

1. [Импорт](#импорт)
2. [Результат](#результат)
3. [Валидационное правило](#валидационное-правило)
4. [Цепочка AND](#цепочка-and)
5. [Ветки OR и валидатор](#ветки-or-и-валидатор)
6. [Параметр shouldReturnError](#параметр-shouldreturnerror)
7. [Объект](#объект)
8. [Массив](#массив)
9. [Кортеж](#кортеж)
10. [Декораторы](#декораторы)
11. [Готовые правила](#готовые-правила)

## Импорт

В `tsconfig` проекта настроены алиасы на исходники:

```typescript
import {
  isString,
  isNumber,
  composeValidator,
  validateValue,
  validateValueFromRules,
  createObjectValidationRule,
  SuccessResult,
  ErrorResult,
} from '@validation';

import { isString } from '@validation/rules';
import { composeValidator, createObjectValidationRule } from '@validation/factories';
import { validateValue, validateValueFromRules } from '@validation/functions';
import { SuccessResult, ErrorResult } from '@validation/utils';
```

`@validation/utils` — это конструкторы `SuccessResult` и `ErrorResult`. Декораторы лежат в `@validation/factories`.

## Результат

Любое правило и любой валидатор возвращают одно из двух значений. Исключение наружу не бросается.

```typescript
interface ISuccess<Data = any> {
  status: 'success';
  data: Data;
}

interface IError<Message extends string = string, Errors = undefined> {
  status: 'error';
  message: Message;
  errors: Errors;
}
```

`SuccessResult` и `ErrorResult` — конструкторы этих объектов.

```typescript
const success = new SuccessResult(42);
// { status: 'success', data: 42 }

const error = new ErrorResult('Value should be number', undefined);
// { status: 'error', message: 'Value should be number', errors: undefined }
```

Дальше по коду результат читается через `status`:

```typescript
const result = isString('hello');

if (result.status === 'success') {
  result.data; // string
} else {
  result.message; // 'Value should be string'
  result.errors; // undefined у атомарного правила
}
```

Текст ошибки у готовых правил — строковый литерал. После склейки AND/OR TypeScript показывает объединение возможных сообщений, а не просто `string`.

## Валидационное правило

Правило — функция одного значения. На успехе в `data` лежит проверенное значение, часто суженное или помеченное номинальным типом. На ошибке `errors` у атомарного правила равен `undefined`.

```typescript
import isNumber from '@validation/rules/isNumber';

const ok = isNumber(42);
// ISuccess<number> | IError<'Value should be number', undefined>

const failed = isNumber('42');
// status: 'error', message: 'Value should be number'
```

Второе правило в цепочке может требовать уже суженный вход. `isPositiveNumber` принимает `number`, поэтому перед ним стоит `isNumber`. Если успех предыдущего правила не является `number`, TypeScript цепочку не примет.

```typescript
import {
  isNumber,
  isPositiveNumber,
  isString,
  validateValueFromRules,
} from '@validation';

validateValueFromRules(25, [isNumber, isPositiveNumber]);

validateValueFromRules('25', [isString, isPositiveNumber]);
// Ошибка типа: Type 'string' is not assignable to type 'number'.
// isString на успехе даёт string, а isPositiveNumber ждёт number.
```

Часть правил при успехе добавляет номинальный тип. В рантайме это то же самое значение, бренд существует только в типе:

```typescript
import isPositiveNumber from '@validation/rules/isPositiveNumber';

isPositiveNumber(5);
// ISuccess<TPositiveNumberNominal>
// data в рантайме — число 5
```

### Своё правило

Правило обязано вернуть `SuccessResult` или `ErrorResult` на любом входе, включая мусор из рантайма. Ошибку нужно вернуть, а не бросить. Если `shouldReturnError` равен `true`, правило сразу возвращает свою ошибку и не смотрит на значение: так цепочка AND добирает сообщения следующих правил после первого падения.

```typescript
import { ErrorResult, SuccessResult } from '@validation/utils';

type TValidationParams = { shouldReturnError?: boolean };

export const IS_NON_EMPTY_STRING_ERROR_MESSAGE = 'Value should be a non-empty string' as const;

export default function isNonEmptyString<
  const Params extends TValidationParams | undefined = undefined,
>(value: string, params?: Params) {
  if (params?.shouldReturnError === true) {
    return new ErrorResult(IS_NON_EMPTY_STRING_ERROR_MESSAGE, undefined);
  }
  try {
    if (value.length > 0) {
      return new SuccessResult(value);
    }
    return new ErrorResult(IS_NON_EMPTY_STRING_ERROR_MESSAGE, undefined);
  } catch (error) {
    console.error(error);
    return new ErrorResult(IS_NON_EMPTY_STRING_ERROR_MESSAGE, undefined);
  }
}
```

Вход `string` означает: в цепочке перед этим правилом уже стоит проверка на строку. Само правило при этом всё равно ловит исключение, потому что после чужой ошибки в него может приехать любое значение.

## Цепочка AND

`validateValueFromRules` прогоняет значение через список правил слева направо. Каждое следующее правило получает `data` предыдущего успеха.

Успех цепочки — пересечение успехов всех правил. Ошибка — сообщения упавших правил, склеенные через `. ` (разделитель по умолчанию). В `errors` лежит массив ошибок этих правил, в том порядке, в котором они упали.

Цепочка не останавливается на первой ошибке. После неё остальные правила вызываются с `shouldReturnError: true` и добавляют свои сообщения. Поэтому каждое правило должно уметь вернуть ошибку в нужном формате.

```typescript
import {
  isNumber,
  isPositiveNumber,
  validateValueFromRules,
} from '@validation';

const age = validateValueFromRules(25, [isNumber, isPositiveNumber]);
// ISuccess<number & TPositiveNumberNominal>

const notAge = validateValueFromRules('25', [isNumber, isPositiveNumber]);
// status: 'error'
// message: 'Value should be number. Value should be positive number'
// errors: [ошибка isNumber, ошибка isPositiveNumber]
```

Если число есть, но оно не положительное, в сообщении останется только второе правило: первое прошло и в список ошибок не попало.

Свой разделитель передаётся третьим аргументом:

```typescript
validateValueFromRules('25', [isNumber, isPositiveNumber], {
  separator: ' и ',
});
// message: 'Value should be number и Value should be positive number'
```

## Ветки OR и валидатор

OR — это список веток. Ветка бывает двух видов:

- массив правил: одна AND-цепочка;
- уже собранный валидатор: вложенный `composeValidator`.

В каждую ветку передаётся одно и то же валидируемое значение, слева направо. Если ветка вернула успех, вызов на этом заканчивается: в `data` лежит это значение, следующие ветки не вызываются. Если ветка вернула ошибку, ошибка запоминается и вызывается следующая ветка. Если ошиблись все, результат — ошибка: `message` склеивает сообщения веток через ` or `, `errors` — массив веток, внутри каждой ветки — массив ошибок её правил.

`validateValue` делает это один раз. `composeValidator` возвращает функцию с тем же поведением, её можно класть в объект, массив и кортеж.

```typescript
import {
  composeValidator,
  isNumber,
  isPositiveNumber,
  isString,
  isUndefined,
  validateValue,
} from '@validation';

const asString = validateValue('abc', [
  [isString],
  [isNumber, isPositiveNumber],
]);
// status: 'success', data: 'abc'
// isString принял значение, ветка с isNumber не вызывалась

const asNumber = validateValue(42, [
  [isString],
  [isNumber, isPositiveNumber],
]);
// status: 'success', data: 42
// isString вернул ошибку, isNumber и isPositiveNumber приняли то же значение 42

const failed = validateValue(true, [
  [isString],
  [isNumber, isPositiveNumber],
]);
// message: 'Value should be string or Value should be number. Value should be positive number'
// errors: [
//   [ошибка isString],
//   [ошибка isNumber, ошибка isPositiveNumber],
// ]
```

Тот же набор веток как переиспользуемая функция:

```typescript
const stringOrPositive = composeValidator([
  [isString],
  [isNumber, isPositiveNumber],
]);

stringOrPositive('abc');
stringOrPositive(5);
stringOrPositive(true);
```

Опциональное значение — это OR с `isUndefined`:

```typescript
const optionalString = composeValidator([
  [isString],
  [isUndefined],
]);

optionalString(undefined); // успех, data: undefined
optionalString('abc');     // успех, data: string
optionalString(1);         // ошибка, обе ветки
```

Вложенный валидатор внутри ветки раскрывается так же, как если бы его правила лежали прямо в этой ветке:

```typescript
const positive = composeValidator([[isNumber, isPositiveNumber]]);

const nameOrPositive = composeValidator([
  [isString],
  [positive],
]);
```

Разделители задаются вторым аргументом `composeValidator` или третьим аргументом `validateValue`. У `composeValidator` те же ключи можно передать и при вызове: `separatorOR`, `separatorAND` и `shouldReturnError`. Переданный ключ заменяет значение из создания, отсутствующий ключ оставляет его.

```typescript
const validator = composeValidator(
  [
    [isString],
    [isNumber, isPositiveNumber],
  ],
  { separatorOR: ' либо ', separatorAND: ' + ' },
);

validator(true);
// 'Value should be string либо Value should be number + Value should be positive number'
```

По умолчанию AND — `'. '`, OR — `' or '`.

```typescript
const alwaysError = composeValidator(
  [[isString], [isNumber, isPositiveNumber]],
  { separatorOR: ' либо ', separatorAND: ' + ', shouldReturnError: true },
);

alwaysError('abc');
// status: 'error', тип результата — только IError
// 'Value should be string либо Value should be number + Value should be positive number'

alwaysError('abc', { shouldReturnError: false, separatorOR: ' || ' });
// status: 'success', data: 'abc'
```

## Параметр shouldReturnError

Второй аргумент правила и валидатора — `{ shouldReturnError?: boolean }`.

Литерал `true` меняет и рантайм, и тип. Функция возвращает ошибку даже для верного значения, а тип результата — только `IError`, без `ISuccess`. Так можно посмотреть полную форму ошибки, не подбирая заведомо плохое значение.

```typescript
const forced = isString('hello', { shouldReturnError: true });
// тип: IError<'Value should be string', undefined>
// status: 'error', хотя строка валидна
```

Если флаг имеет тип `boolean`, а не литерал `true`, тип остаётся объединением успеха и ошибки: компилятор не знает, какая ветка случится в рантайме.

Тот же флаг можно передать в `validateValue`, `validateValueFromRules` и в валидатор объекта, массива или кортежа. Тогда его получают вложенные правила.

У `composeValidator`, `createObjectValidationRule`, `createArrayValidationRule` и `createTupleValidationRule` часть ключей задаётся и при создании, и при вызове. Переданный ключ вызова заменяет ключ создания. Если в вызове ключа нет, остаётся значение из создания.

| Функция | Ключи создания и вызова | Только при создании |
|---|---|---|
| `composeValidator` | `separatorOR`, `separatorAND`, `shouldReturnError` | нет |
| `createObjectValidationRule` | `shouldReturnError` | `errorMessageHypernym`, `errorMessageHypernymSeparator`, `errorMessageFieldSeparator` |
| `createArrayValidationRule` | `shouldReturnError`, `skipInvalidIndexInValidResults` | `errorMessageHypernym`, `errorMessageEmptyHypernym`, `errorMessageHypernymSeparator`, `errorMessageIndexSeparator` |
| `createTupleValidationRule` | `shouldReturnError` | `errorMessageHypernym`, `errorMessageHypernymSeparator`, `errorMessageIndexSeparator` |

`validateValue` и `validateValueFromRules` принимают параметры только в момент вызова.

## Объект

`createObjectValidationRule` принимает схему: имя поля и валидатор этого поля. В схему кладётся результат `composeValidator`, а не голое правило.

Успех — объект с `data` полей. Ошибка собирает сообщения по упавшим полям. Поле `errors` хранит ошибку каждого упавшего поля. Поле `valid` хранит `data` полей, которые прошли. Общее `message` имеет тип `string`: набор упавших полей известен только в рантайме. Литералы сообщений остаются на ошибках полей.

```typescript
import {
  composeValidator,
  createObjectValidationRule,
  isNumber,
  isPositiveNumber,
  isString,
  isUndefined,
} from '@validation';

const userRule = createObjectValidationRule({
  name: composeValidator([[isString]]),
  age: composeValidator([[isNumber, isPositiveNumber]]),
});

const ok = userRule({ name: 'John', age: 25 });
// ISuccess<{ name: string, age: number & TPositiveNumberNominal }>

const failed = userRule({ name: 1, age: 25 });
if (failed.status === 'error') {
  failed.message;
  // 'Object validation failed for the following fields: \nname: Value should be string'

  failed.errors?.name; // ошибка поля name
  failed.errors?.age;  // undefined, возраст прошёл

  failed.valid?.age;   // 25
  failed.valid?.name;  // undefined
}
```

Тексты можно заменить при создании правила:

```typescript
const userRuleWithTexts = createObjectValidationRule(
  {
    name: composeValidator([[isString]]),
    age: composeValidator([[isNumber, isPositiveNumber]]),
  },
  {
    errorMessageHypernym: 'Пользователь не прошёл проверку',
    errorMessageHypernymSeparator: ' — ',
    errorMessageFieldSeparator: ' — ',
  },
);
```

По умолчанию заголовок — `Object validation failed for the following fields`, оба разделителя — `': '`.

`shouldReturnError` можно передать вторым аргументом `createObjectValidationRule`. Тогда он действует на каждый вызов. Аргумент вызова перекрывает его.

```typescript
const alwaysError = createObjectValidationRule(
  { name: composeValidator([[isString]]) },
  { shouldReturnError: true },
);

alwaysError({ name: 'John' });
// status: 'error', тип результата — только IError

alwaysError({ name: 'John' }, { shouldReturnError: false });
// status: 'success', data: { name: 'John' }
```

Необязательное поле — валидатор с веткой `isUndefined`:

```typescript
const withNickname = createObjectValidationRule({
  nickname: composeValidator([[isString], [isUndefined]]),
});

withNickname({ nickname: undefined }); // успех
```

Если значение не прошло `isObject`, валидатор каждого поля вызывается с `shouldReturnError: true`. Заголовок остаётся `Object validation failed for the following fields`. `isObject` принимает обычный объект.

## Массив

`createArrayValidationRule` проверяет каждый элемент одним и тем же валидатором.

Успех — массив `data` элементов. Ошибка хранит индексы. В `errors` на месте проваленного элемента лежит его ошибка, на месте прошедшего — `undefined`. В `valid` наоборот: прошедшие значения стоят на своих индексах, проваленные — `undefined`. Сообщение перечисляет индексы упавших элементов. Общее `message` снова имеет тип `string`.

```typescript
import {
  composeValidator,
  createArrayValidationRule,
  isString,
} from '@validation';

const strings = createArrayValidationRule(composeValidator([[isString]]));

strings(['a', 'b']);
// ISuccess<string[]>

const failed = strings(['a', 1, 'c']);
if (failed.status === 'error') {
  failed.errors?.[0]; // undefined
  failed.errors?.[1]; // ошибка «Value should be string»
  failed.valid;       // ['a', undefined, 'c']
  // тип valid: Array<string | undefined>
}
```

`skipInvalidIndexInValidResults: true` убирает дырки из `valid`: туда попадают только успешные элементы, без `undefined` на местах ошибок. `errors` по-прежнему выровнен по индексу исходного массива. Флаг можно задать при создании правила и перекрыть аргументом вызова, так же как `shouldReturnError`.

```typescript
const compact = strings(['a', 1, 'c'], { skipInvalidIndexInValidResults: true });
if (compact.status === 'error') {
  compact.valid; // ['a', 'c']
  // тип valid: Array<string>
  compact.errors?.[1]; // ошибка второго элемента
}
```

Тип смотрит на литерал флага:

| Что передано | Тип `valid` |
|---|---|
| флаг не передан или `false` | `Array<Data \| undefined>` |
| `skipInvalidIndexInValidResults: true` | `Array<Data>` |
| флаг типа `boolean`, не литерал | `Array<Data \| undefined>` |

В последнем случае рантайм зависит от значения. Тип остаётся широким, потому что `boolean` — это и `true`, и `false`.

`shouldReturnError` можно передать вторым аргументом `createArrayValidationRule`. Тогда он действует на каждый вызов правила. Аргумент самого вызова перекрывает его: переданный ключ заменяет значение из создания, отсутствующий ключ оставляет значение из создания.

```typescript
const alwaysError = createArrayValidationRule(
  composeValidator([[isString]]),
  { shouldReturnError: true },
);

alwaysError(['a', 'b']);
// status: 'error', тип результата — только IError

alwaysError(['a', 'b'], { shouldReturnError: false });
// status: 'success', data: ['a', 'b']
// тип снова ISuccess | IError
```

Если значение не массив или это пустой массив при итоговом `shouldReturnError: true`, сообщение начинается с `Array does not consist of elements following next validation rules`. Для обычного массива с битыми элементами заголовок — `Array validation failed for the following elements`.

Свои тексты:

```typescript
createArrayValidationRule(composeValidator([[isString]]), {
  errorMessageHypernym: 'Список строк',
  errorMessageEmptyHypernym: 'Это не список строк',
  errorMessageHypernymSeparator: ' — ',
  errorMessageIndexSeparator: ' — ',
});
```

## Кортеж

`createTupleValidationRule` проверяет массив фиксированной длины: у каждой позиции свой валидатор. Успех — кортеж `data`. Ошибка — кортеж ошибок той же длины, прошедшие позиции в нём равны `undefined`. В `valid` лежат успешные позиции, тип этого поля частичный.

```typescript
import {
  composeValidator,
  createTupleValidationRule,
  isNumber,
  isString,
} from '@validation';

const pair = createTupleValidationRule([
  composeValidator([[isString]]),
  composeValidator([[isNumber]]),
]);

pair(['hello', 42]);
// ISuccess<[string, number]>

const failed = pair(['hello', '42']);
if (failed.status === 'error') {
  failed.errors?.[0]; // undefined
  failed.errors?.[1]; // ошибка isNumber
  failed.valid?.[0];  // 'hello'
}
```

Заголовок по умолчанию — `Tuple validation failed for the following elements`. Тексты задаются только при создании: `errorMessageHypernym`, `errorMessageHypernymSeparator`, `errorMessageIndexSeparator`. По умолчанию оба разделителя — `': '`.

Если значение не массив, валидатор каждой позиции вызывается с `shouldReturnError: true`. Заголовок остаётся тем же.

`shouldReturnError` можно передать вторым аргументом `createTupleValidationRule`. Тогда он действует на каждый вызов. Аргумент вызова перекрывает его.

```typescript
const alwaysError = createTupleValidationRule(
  [composeValidator([[isString]]), composeValidator([[isNumber]])],
  { shouldReturnError: true },
);

alwaysError(['hello', 42]);
// status: 'error', тип результата — только IError

alwaysError(['hello', 42], { shouldReturnError: false });
// status: 'success', data: ['hello', 42]
```

## Декораторы

### Своя ошибка

`decorateWithCustomError` оборачивает атомарное правило. Успех не меняется. Ошибка заменяется на переданный `ErrorResult` или на результат фабрики. Фабрика получает исходную ошибку.

Декоратор рассчитан на правило, не на валидатор из `composeValidator`.

```typescript
import {
  decorateWithCustomError,
  ErrorResult,
  isString,
} from '@validation';

const nameRule = decorateWithCustomError(
  isString,
  new ErrorResult('Имя должно быть строкой', undefined),
);

nameRule(1);
// message: 'Имя должно быть строкой'

const withOriginal = decorateWithCustomError(isString, (original) => (
  new ErrorResult(`Имя: ${original.message}`, undefined)
));
```

### Значение по умолчанию

`decorateWithDefaultValue` при ошибке дописывает в результат поле `data`. Это не замена ошибки успехом: `status` остаётся `'error'`, рядом лежит запасное значение. Можно передать само значение или фабрику от исходной ошибки и входного значения. Декоратор принимает и правило, и валидатор.

```typescript
import {
  composeValidator,
  decorateWithDefaultValue,
  isString,
} from '@validation';

const nameOrEmpty = decorateWithDefaultValue(isString, '');

const failed = nameOrEmpty(1);
if (failed.status === 'error') {
  failed.message; // 'Value should be string'
  failed.data;    // ''
}

const ageOrZero = decorateWithDefaultValue(
  composeValidator([[isNumber]]),
  (_error, value) => (typeof value === 'number' ? value : 0),
);
```

Тип ошибки после декоратора — исходная ошибка, пересечённая с `{ data: типЗапасногоЗначения }`.

## Готовые правила

Импорт из `@validation` или `@validation/rules`. Сообщение правила — константа рядом с функцией, например `IS_STRING_ERROR_MESSAGE`.

Проверки типа значения, вход `any`:

| Правило | Успех | Сообщение |
|---|---|---|
| `isString` | `string` | `Value should be string` |
| `isNumber` | `number` | `Value should be number` |
| `isBoolean` | `boolean` | `Value should be boolean` |
| `isUndefined` | `undefined` | `Value should be undefined` |
| `isNull` | `null` | `Value should be null` |
| `isSymbol` | `symbol` | `Value should be symbol` |
| `isFunction` | функция | `Value should be function` |
| `isDate` | `Date` | `Value should be Date` |
| `isPromise` | `Promise` | `Value should be Promise` |
| `isObject` | объект | `Value should be object` |
| `isArray` | `any[]` | `Value should be array` |
| `isNaN` | `number` (`NaN`) | `Value should be NaN` |

Строка после `isString`. Вход этих правил — `string`:

| Правило | Успех | Сообщение |
|---|---|---|
| `isOnlyEnglishLettersString` | `string & TOnlyLatinLettersNominal` | `Value should contain only Latin letters` |
| `isOnlyDigitsString` | `string & TOnlyDigitsNominal` | `Value should contain only digits` |

В публичном барреле правило латинских букв называется `isOnlyEnglishLettersString`. Файл и текст ошибки говорят про Latin letters.

Число после `isNumber`:

| Правило | Успех | Сообщение |
|---|---|---|
| `isPositiveNumber` | `TPositiveNumberNominal` | `Value should be positive number` |

Длина массива. Это фабрики: `isArrayMinLength(2)`. Ставить их после `isArray`. Условие в коде такое: минимум — `length >= n`, максимум — `length <= n`, точная длина — `length === n`.

| Правило | Сообщение |
|---|---|
| `isArrayMinLength(n)` | `Array should contain more than ${n} elements` |
| `isArrayMaxLength(n)` | `Array should contain less than ${n} elements` |
| `isArrayExactLength(n)` | `Array should contain exactly ${n} elements` |

Коллекции и бинарные типы: `isMap`, `isSet`, `isWeakMap`, `isWeakSet`, `isArrayBuffer`, `isSharedArrayBuffer`, `isDataView`, `isInt8Array`, `isInt16Array`, `isInt32Array`, `isUint8Array`, `isUint8ClampedArray`, `isUint16Array`, `isUint32Array`, `isFloat32Array`, `isFloat64Array`, `isBigInt64Array`, `isBigUint64Array`. Успех — соответствующий экземпляр. Текст ошибки у каждого свой, его константа экспортируется рядом с функцией. У `isMap` это `Value should be a Map`, у `isSet` — `Value should be Set`.

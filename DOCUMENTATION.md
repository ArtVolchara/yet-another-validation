# Документация системы валидации

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Архитектура](#архитектура)
3. [API Reference](#api-reference)
4. [Примеры использования](#примеры-использования)
5. [Типы и интерфейсы](#типы-и-интерфейсы)
6. [Лучшие практики](#лучшие-практики)
7. [Тестирование](#тестирование)

---

## 🎯 Обзор системы

Система валидации построена на принципах функционального программирования и Domain-Driven Design (DDD). Основные особенности:

- **Функциональный подход**: Все валидаторы - чистые функции без побочных эффектов
- **Result паттерн**: Вместо исключений используются `SuccessResult` и `ErrorResult`
- **AND/OR логика**: Поддержка сложной логики валидации
- **Типобезопасность**: Полная поддержка TypeScript с inference типов
- **Композируемость**: Сложные валидаторы из простых компонентов

### Основные концепции

#### Result Pattern
```typescript
// Успешный результат
interface SuccessResult<T> {
  status: 'success';
  data: T;
}

// Ошибка валидации
interface ErrorResult<Message, Data> {
  status: 'error';
  message: Message;
  data: Data;
}
```

#### AND/OR Логика
```typescript
// (A AND B) OR (C AND D)
const validator = composeValidator(
  [ruleA, ruleB], // AND группа
  [ruleC, ruleD]  // AND группа
);
```

---

## 🏗️ Архитектура

### Структура проекта

```
src/
├── index.ts                    # Главный экспорт
├── Validation/
│   └── domain/
│       ├── rules/             # Атомарные правила валидации
│       ├── factories/         # Фабрики для создания валидаторов
│       └── functions/         # Основные функции валидации
└── _Root/
    └── domain/
        └── factories/         # Утилиты (SuccessResult, ErrorResult)
```

### Модульная архитектура экспортов

```typescript
// Общий API
import { isString, composeValidator, SuccessResult } from '@validation';

// Специализированные модули
import { isString } from '@validation/rules';
import { composeValidator } from '@validation/factories';
import { validateValue } from '@validation/functions';
import { SuccessResult, ErrorResult } from '@validation/utils';
```

---

## 📚 API Reference

### Основные функции

#### `composeValidator(...validators)`

Создает композитный валидатор с OR логикой.

**Параметры:**
- `validators`: Массив массивов валидаторов. Каждый внутренний массив представляет AND группу.

**Возвращает:**
- `TValidator<InputData, Success, Error>` - функцию-валидатор

**Пример:**
```typescript
const validator = composeValidator(
  [isString, isOnlyEnglishLettersString], // AND группа 1
  [isNumber, isPositiveNumber]           // AND группа 2
);

// Логика: (isString AND isOnlyEnglishLettersString) OR (isNumber AND isPositiveNumber)
```

#### `validateValue(value, ...validators)`

Низкоуровневая функция валидации с OR логикой.

**Параметры:**
- `value`: Значение для валидации
- `validators`: Массив массивов валидаторов

**Возвращает:**
- `TResult<Success, Error>` - результат валидации

#### `validateValueFromRules(value, ...rules)`

Низкоуровневая функция валидации с AND логикой.

**Параметры:**
- `value`: Значение для валидации
- `rules`: Правила валидации (AND логика)

**Возвращает:**
- `TResult<Success, Error>` - результат валидации

### Фабрики валидаторов

#### `createObjectValidationRule(schema)`

Создает валидатор для объектов.

**Параметры:**
- `schema`: Объект с валидаторами для каждого поля

**Возвращает:**
- `TValidator<object, object, ErrorResult>`

**Пример:**
```typescript
const userSchema = {
  name: composeValidator([isString, isOnlyEnglishLettersString]),
  age: composeValidator([isNumber, isPositiveNumber]),
  isActive: composeValidator([isBoolean])
};

const userValidator = createObjectValidationRule(userSchema);
```

#### `createArrayValidationRule(validator)`

Создает валидатор для массивов.

**Параметры:**
- `validator`: Валидатор для элементов массива

**Возвращает:**
- `TValidator<Array<any>, Array<any>, ErrorResult>`

**Пример:**
```typescript
const stringArrayValidator = createArrayValidationRule(
  composeValidator([isString])
);
```

#### `createTupleValidationRule(validators)`

Создает валидатор для кортежей.

**Параметры:**
- `validators`: Массив валидаторов для каждого элемента кортежа

**Возвращает:**
- `TValidator<Array<any>, Array<any>, ErrorResult>`

**Пример:**
```typescript
const tupleValidator = createTupleValidationRule([
  composeValidator([isString]),
  composeValidator([isNumber])
]);
```

### Правила валидации

#### Примитивные типы

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isNull,
  isUndefined,
  isFunction,
  isSymbol,
  isDate,
  isPromise,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet
} from '@validation/rules';
```

#### Специализированные правила

```typescript
import {
  isPositiveNumber,
  isOnlyDigitsString,
  isOnlyEnglishLettersString,
  isArrayMinLength,
  isArrayMaxLength,
  isArrayExactLength
} from '@validation/rules';
```

#### Типизированные массивы

```typescript
import {
  isInt8Array,
  isInt16Array,
  isInt32Array,
  isUint8Array,
  isUint16Array,
  isUint32Array,
  isUint8ClampedArray,
  isFloat32Array,
  isFloat64Array,
  isBigInt64Array,
  isBigUint64Array,
  isArrayBuffer,
  isSharedArrayBuffer,
  isDataView
} from '@validation/rules';
```

---

## 💡 Примеры использования

### Простая валидация

```typescript
import { isString, isNumber, composeValidator } from '@validation';

// Строка ИЛИ число
const validator = composeValidator([isString], [isNumber]);

const result1 = validator('test'); // ✅ Успех
const result2 = validator(123);    // ✅ Успех
const result3 = validator(true);   // ❌ Ошибка
```

### Сложная валидация

```typescript
import { 
  isString, 
  isOnlyEnglishLettersString,
  isNumber, 
  isPositiveNumber,
  composeValidator 
} from '@validation';

// (Строка И только буквы) ИЛИ (Число И положительное)
const validator = composeValidator(
  [isString, isOnlyEnglishLettersString], // AND группа
  [isNumber, isPositiveNumber]           // AND группа
);

const result1 = validator('Hello'); // ✅ Успех
const result2 = validator(42);      // ✅ Успех
const result3 = validator('123');   // ❌ Ошибка
const result4 = validator(-5);      // ❌ Ошибка
```

### Валидация объектов

```typescript
import { 
  isString, 
  isOnlyEnglishLettersString,
  isNumber, 
  isPositiveNumber,
  isBoolean,
  composeValidator,
  createObjectValidationRule 
} from '@validation';

const userSchema = {
  name: composeValidator([isString, isOnlyEnglishLettersString]),
  age: composeValidator([isNumber, isPositiveNumber]),
  isActive: composeValidator([isBoolean])
};

const userValidator = createObjectValidationRule(userSchema);

const user = {
  name: 'John',
  age: 30,
  isActive: true
};

const result = userValidator(user);
```

### Валидация массивов

```typescript
import { 
  isString, 
  composeValidator,
  createArrayValidationRule 
} from '@validation';

const stringArrayValidator = createArrayValidationRule(
  composeValidator([isString])
);

const result = stringArrayValidator(['a', 'b', 'c']);
```

### Валидация кортежей

```typescript
import { 
  isString, 
  isNumber,
  composeValidator,
  createTupleValidationRule 
} from '@validation';

const tupleValidator = createTupleValidationRule([
  composeValidator([isString]),
  composeValidator([isNumber])
]);

const result = tupleValidator(['test', 123]);
```

### Обработка результатов

```typescript
import { SuccessResult, ErrorResult } from '@validation';

const result = validator(value);

if (result.status === 'success') {
  const { data } = result;
  // Используем валидированные данные
  console.log('Валидация успешна:', data);
} else {
  const { message, data } = result;
  // Обрабатываем ошибки
  console.log('Ошибка валидации:', message);
  console.log('Детали ошибок:', data);
}
```

---

## 🔧 Типы и интерфейсы

### Основные типы

```typescript
// Правило валидации
type TValidationRule<InputData, Success> = (value: InputData) => TResult<Success, IError>;

// Массив правил валидации
type TValidationRules = Array<TValidationRule>;

// Валидатор с OR логикой
type TValidator<InputData, Success, Error> = (value: InputData) => TResult<Success, Error>;

// Результат валидации
type TResult<Success, Error> = SuccessResult<Success> | ErrorResult<string, Error>;
```

### Интерфейсы результатов

```typescript
// Успешный результат
interface SuccessResult<T> {
  status: 'success';
  data: T;
}

// Ошибка валидации
interface ErrorResult<Message, Data> {
  status: 'error';
  message: Message;
  data: Data;
}
```

### Структура ошибок

Для OR логики структура ошибок имеет вид:
```typescript
// Array<Array<ErrorResult>> - [AND группа 1, AND группа 2, ...]
```

**Пример структуры:**
```typescript
[
  [ErrorResult1, ErrorResult2], // AND группа 1
  [ErrorResult3, ErrorResult4]  // AND группа 2
]
```

---

## 🎯 Лучшие практики

### 1. Создание переиспользуемых валидаторов

```typescript
// ✅ Хорошо: Создаем именованные валидаторы
const emailValidator = composeValidator([isString, isEmailFormat]);
const ageValidator = composeValidator([isNumber, isPositiveNumber, isAgeRange]);

// ❌ Плохо: Дублируем логику
const user1Validator = createObjectValidationRule({
  email: composeValidator([isString, isEmailFormat]),
  age: composeValidator([isNumber, isPositiveNumber, isAgeRange])
});
```

### 2. Использование типизации

```typescript
// ✅ Хорошо: Явная типизация
interface User {
  name: string;
  age: number;
  email: string;
}

const userValidator: TValidator<User, User, ErrorResult> = createObjectValidationRule({
  name: composeValidator([isString]),
  age: composeValidator([isNumber]),
  email: composeValidator([isString])
});

// ❌ Плохо: Отсутствие типизации
const userValidator = createObjectValidationRule({
  name: composeValidator([isString]),
  age: composeValidator([isNumber]),
  email: composeValidator([isString])
});
```

### 3. Обработка ошибок

```typescript
// ✅ Хорошо: Структурированная обработка
const result = validator(value);

if (result.status === 'success') {
  return result.data;
} else {
  // Логируем ошибки
  console.error('Validation failed:', result.message);
  
  // Возвращаем fallback или выбрасываем ошибку
  throw new Error(`Validation failed: ${result.message}`);
}

// ❌ Плохо: Игнорирование ошибок
const result = validator(value);
return result.data; // Может быть undefined
```

### 4. Композиция валидаторов

```typescript
// ✅ Хорошо: Разбиваем на простые компоненты
const stringValidator = composeValidator([isString]);
const emailValidator = composeValidator([stringValidator, isEmailFormat]);
const passwordValidator = composeValidator([stringValidator, isPasswordStrength]);

const userValidator = createObjectValidationRule({
  email: emailValidator,
  password: passwordValidator
});

// ❌ Плохо: Сложная логика в одном месте
const userValidator = createObjectValidationRule({
  email: composeValidator([isString, isEmailFormat]),
  password: composeValidator([isString, isPasswordStrength])
});
```

### 5. Тестирование валидаторов

```typescript
// ✅ Хорошо: Тестируем каждый валидатор отдельно
describe('emailValidator', () => {
  it('should accept valid email', () => {
    const result = emailValidator('test@example.com');
    expect(result.status).toBe('success');
  });

  it('should reject invalid email', () => {
    const result = emailValidator('invalid-email');
    expect(result.status).toBe('error');
  });
});

// ❌ Плохо: Тестируем только интеграцию
describe('userValidator', () => {
  it('should validate user', () => {
    const user = { email: 'test@example.com', password: 'password' };
    const result = userValidator(user);
    expect(result.status).toBe('success');
  });
});
```

---

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Тесты в режиме watch
npm run test:watch

# Тесты с покрытием
npm run test:coverage

# Подробные тесты
npm run test:verbose
```

### Структура тестов

```typescript
describe('composeValidator', () => {
  // Arrange
  const validator = composeValidator([isString], [isNumber]);

  describe('when value is string', () => {
    it('should return success', () => {
      // Act
      const result = validator('test');

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toBe('test');
    });
  });

  describe('when value is number', () => {
    it('should return success', () => {
      // Act
      const result = validator(123);

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toBe(123);
    });
  });

  describe('when value is boolean', () => {
    it('should return error', () => {
      // Act
      const result = validator(true);

      // Assert
      expect(result.status).toBe('error');
      expect(result.message).toContain('Expected string or number');
    });
  });
});
```

### Тестирование сложной логики

```typescript
describe('complexValidator', () => {
  const validator = composeValidator(
    [isString, isOnlyEnglishLettersString], // AND группа 1
    [isNumber, isPositiveNumber]           // AND группа 2
  );

  it('should accept valid string', () => {
    const result = validator('Hello');
    expect(result.status).toBe('success');
  });

  it('should accept valid number', () => {
    const result = validator(42);
    expect(result.status).toBe('success');
  });

  it('should reject invalid string', () => {
    const result = validator('Hello123');
    expect(result.status).toBe('error');
  });

  it('should reject negative number', () => {
    const result = validator(-5);
    expect(result.status).toBe('error');
  });
});
```

### Тестирование объектов

```typescript
describe('objectValidator', () => {
  const userValidator = createObjectValidationRule({
    name: composeValidator([isString]),
    age: composeValidator([isNumber])
  });

  it('should accept valid user', () => {
    const user = { name: 'John', age: 30 };
    const result = userValidator(user);
    expect(result.status).toBe('success');
  });

  it('should reject invalid user', () => {
    const user = { name: 123, age: 'thirty' };
    const result = userValidator(user);
    expect(result.status).toBe('error');
  });
});
```

---

## 📝 Заключение

Система валидации предоставляет мощный и гибкий API для создания типобезопасных валидаторов. Основные преимущества:

- **Функциональный подход** обеспечивает предсказуемость и тестируемость
- **Result паттерн** исключает исключения и обеспечивает структурированную обработку ошибок
- **AND/OR логика** позволяет создавать сложные правила валидации
- **Типобезопасность** предотвращает ошибки на этапе компиляции
- **Композируемость** упрощает создание сложных валидаторов из простых компонентов

Используйте эту документацию как руководство для эффективного использования системы валидации в ваших проектах. 
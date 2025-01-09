const errorMessages = {
  nickname: {
    required: {
      en: 'Nickname is required',
      ru: 'Никнейм обязателен',
    },
    invalidType: {
      en: 'Nickname must be a string',
      ru: 'Никнейм должен быть строкой',
    },
    minLength: {
      en: 'Nickname must be at least 3 characters long',
      ru: 'Никнейм должен содержать минимум 3 символа',
    },
    maxLength: {
      en: 'Nickname must be at most 20 characters long',
      ru: 'Никнейм должен содержать максимум 20 символов',
    },
    unique: {
      en: 'User with this nickname already exists',
      ru: 'Пользователь с данным никнеймом уже существует',
    },
  },
  email: {
    required: {
      en: 'Email is required',
      ru: 'Email обязателен',
    },
    invalid: {
      en: 'Email must be a valid address',
      ru: 'Email должен быть действительным адресом',
    },
    unique: {
      en: 'User with this email already exists',
      ru: 'Пользователь с данным почтовым адресом уже существует',
    },
  },
  password: {
    required: {
      en: 'Password is required',
      ru: 'Пароль обязателен',
    },
    invalidType: {
      en: 'Invalid password',
      ru: 'Пароль содержит недоступные символы',
    },
    minLength: {
      en: 'Password must be at least 8 characters long',
      ru: 'Пароль должен содержать не менее 8 символов',
    },
    maxLength: {
      en: 'Password must be at least 8 characters long',
      ru: 'Пароль не должен быть больше 20 символов',
    },
    containsLetter: {
      en: 'Password must contain at least one letter',
      ru: 'Пароль должен содержать хотя бы одну букву',
    },
    containsNumber: {
      en: 'Password must contain at least one number',
      ru: 'Пароль должен содержать хотя бы одну цифру',
    },
  },
  general: {
    fieldNotRecognized: {
      en: 'Field is not recognized',
      ru: 'Поле не распознано',
    },
    errorNotRecognized: {
      en: 'The error type is not recognized',
      ru: 'Тип ошибки не распознан',
    },
  },
};

type Field = keyof typeof errorMessages;
type ErrorType<T extends Field> = keyof (typeof errorMessages)[T];

export function getErrorMessage<T extends Field>(
  field: T,
  type: ErrorType<T>,
  lang: 'en' | 'ru' = 'en',
): string {
  const fieldMessages = errorMessages[field];

  if (!fieldMessages) {
    return errorMessages.general.fieldNotRecognized[lang];
  }

  const message = fieldMessages[type];

  if (!message) {
    return errorMessages.general.errorNotRecognized[lang];
  }

  return message[lang];
}

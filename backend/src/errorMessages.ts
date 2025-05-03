const errorMessages = {
  nickname: {
    required: {
      en: 'Nickname is required',
      ru: 'Никнейм является обязательным',
    },
    invalidType: {
      en: 'Nickname must be a string',
      ru: 'Никнейм должен быть строкой',
    },
    invalid: {
      en: 'This nickname cannot be taken',
      ru: 'Данный никнейм не может быть взят',
    },
    unique: {
      en: 'This nickname is already taken',
      ru: 'Этот никнейм уже занят',
    },
  },
  email: {
    required: {
      en: 'Email is required',
      ru: 'Электронная почта является обязательной',
    },
    invalidType: {
      en: 'Email must be a valid address',
      ru: 'Электронная почта должна быть действительным адресом',
    },
    unique: {
      en: 'An account with this email already exists',
      ru: 'Пользователь с этим адресом электронной почты уже зарегистрирован',
    },
    notFound: {
      en: 'User not found',
      ru: 'Пользователь не найден',
    },
    cannotChange: {
      en: 'User cannot change email',
      ru: 'Нельзя менять электронную почту',
    },
  },
  id: {
    notFound: {
      en: 'User not found',
      ru: 'Пользователь не найден',
    },
  },
  password: {
    required: {
      en: 'Password is required',
      ru: 'Пароль является обязательным',
    },
    invalidType: {
      en: 'Password contains invalid characters',
      ru: 'Пароль содержит недопустимые символы',
    },
    minLength: {
      en: 'Password must be at least 8 characters long',
      ru: 'Пароль должен содержать не менее 8 символов',
    },
    maxLength: {
      en: 'Password must not exceed 20 characters',
      ru: 'Пароль не должен превышать 20 символов',
    },
    containsLetter: {
      en: 'Password must contain at least one letter',
      ru: 'Пароль должен содержать хотя бы одну букву',
    },
    containsNumber: {
      en: 'Password must contain at least one digit',
      ru: 'Пароль должен содержать хотя бы одну цифру',
    },
    wrongPassword: {
      en: 'Invalid password',
      ru: 'Неверный пароль',
    },
  },
  avatar: {
    invalidType: {
      en: 'Invalid field for avatar',
      ru: 'Неверное поле для аватара',
    },
  },
  board: {
    required: {
      en: 'Board data is required',
      ru: 'Данные доски являются обязательными',
    },
    unique: {
      en: 'Board with this name already exists',
      ru: 'Доска с таким названием уже существует',
    },
    creationFailed: {
      en: 'Failed to create board',
      ru: 'Не удалось создать доску',
    },
    idNotFound: {
      en: 'Board not found',
      ru: 'Доска не найдена',
    },
    invalidIdType: {
      en: 'Board ID must be supported by MongoDB',
      ru: 'ID доски должен поддерживаться MongoDB',
    },
  },
  general: {
    fieldNotRecognized: {
      en: 'This field is not recognized',
      ru: 'Это поле не распознано',
    },
    errorNotRecognized: {
      en: 'The error type is not recognized',
      ru: 'Тип ошибки не распознан',
    },
    tryAnother: {
      en: 'Please try another way',
      ru: 'Пожалуйста, попробуйте другой способ',
    },
    API: {
      en: 'Invalid API Key',
      ru: 'Неверный API ключ',
    },
    devOnly: {
      en: 'This endpoint is available only in development environment',
      ru: 'Эта точка доступа доступна только в среде разработки',
    },
  },
  projectId: {
    required: {
      en: 'Project ID is required',
      ru: 'ID проекта является обязательным',
    },
    invalidType: {
      en: 'Project ID must be supported by MongoDB',
      ru: 'ID проекта должен поддерживаться MongoDB',
    },
  },
  section: {
    required: {
      en: 'Section is required',
      ru: 'Раздел является обязательным',
    },
    invalidType: {
      en: 'Section ID must be supported by MongoDB',
      ru: 'ID раздела должен поддерживаться MongoDB',
    },
  },
  name: {
    required: {
      en: 'Name is required',
      ru: 'Название является обязательным',
    },
    invalidType: {
      en: 'Name must be a string',
      ru: 'Название должно быть строкой',
    },
  },
  type: {
    required: {
      en: 'Type is required',
      ru: 'Тип является обязательным',
    },
    invalidType: {
      en: 'Type must be a string',
      ru: 'Тип должен быть представлен строкой',
    },
  },
};

type Field = keyof typeof errorMessages;
type ErrorType<T extends Field> = keyof (typeof errorMessages)[T];

type ErrorMessages = { [key: string]: string | null };

export function getErrorMessages<T extends Field>(
  errors: { [K in T]?: ErrorType<K> },
  lang: 'en' | 'ru' = 'ru',
): ErrorMessages {
  const result: ErrorMessages = {};

  for (const field in errors) {
    if (errors.hasOwnProperty(field)) {
      const type = errors[field];
      const fieldMessages = errorMessages[field as Field];

      if (!fieldMessages) {
        result[field] = errorMessages.general.fieldNotRecognized[lang];
      } else {
        const message = fieldMessages[type as ErrorType<Field>];
        if (!message) {
          result[field] = errorMessages.general.errorNotRecognized[lang];
        } else {
          result[field] = message[lang];
        }
      }
    }
  }

  return result;
}

export const projectError = {
  project: {
    creationFailed: {
      en: 'Failed to create project',
      ru: 'Не удалось создать проект',
    },
    invalidIdType: {
      en: 'Invalid project ID format',
      ru: 'Неверный формат ID проекта',
    },
    idNotFound: {
      en: 'Project not found',
      ru: 'Проект не найден',
    },
    idNotFoundOrNoAccess: {
      en: "Project not found or you don't have access",
      ru: 'Проект не найден или у вас нет доступа',
    },
    noPermission: {
      en: 'You do not have permission to perform this action',
      ru: 'У вас нет прав для выполнения этого действия',
    },
    CannotDelete: {
      en: 'Only project owner can delete the project',
      ru: 'Только владелец проекта может удалить его',
    },
    updateFailed: {
      en: 'Failed to update project',
      ru: 'Не удалось обновить проект',
    },
    userAlreadyAdded: {
      en: 'User is already added to the project',
      ru: 'Пользователь уже добавлен в проект',
    },
    invalidRole: {
      en: 'Invalid role specified',
      ru: 'Указана недопустимая роль',
    },
    cannotRemoveOwner: {
      en: 'Cannot remove project owner',
      ru: 'Нельзя удалить владельца проекта',
    },
    cannotChangeOwnerRole: {
      en: 'Cannot change owner role',
      ru: 'Нельзя изменить роль владельца',
    },
    userNotFound: {
      en: 'User not found in project',
      ru: 'Пользователь не найден в проекте',
    },
    invalidDescription: {
      en: 'Invalid description format',
      ru: 'Недопустимый формат описания',
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
    updateFailed: {
      en: 'Failed to update section',
      ru: 'Не удалось обновить секцию',
    },
    cannotAddToItself: {
      en: 'Cannot add section to itself',
      ru: 'Нельзя добавить секцию в саму себя',
    },
    parentNotFound: {
      en: 'Parent section not found',
      ru: 'Родительская секция не найдена',
    },
    invalidItemType: {
      en: 'Invalid item type',
      ru: 'Недопустимый тип элемента',
    },
    itemNotFound: {
      en: 'Item not found in section',
      ru: 'Элемент не найден в секции',
    },
    notFound: {
      en: 'Section not found',
      ru: 'Секция не найдена',
    },
    notFoundInProject: {
      en: 'Section not found in this project',
      ru: 'Секция не найдена в данном проекте',
    },
    failedRemoveBoard: {
      en: 'Failed to remove board from section',
      ru: 'Не удалось удалить доску из секции',
    },
  },
} as const;

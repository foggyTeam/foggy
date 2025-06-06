export const elementErrors = {
  element: {
    required: {
      en: 'Element data is required',
      ru: 'Необходимо указать данные элемента',
    },
    invalidType: {
      en: 'Invalid element type',
      ru: 'Недопустимый тип элемента',
    },
    sizeLimit: {
      en: 'Too many elements on the board',
      ru: 'Превышено максимальное количество элементов на доске',
    },
  },
  elementId: {
    invalidType: {
      en: 'ID must be a string',
      ru: 'Идентификатор должен быть строкой',
    },
  },
  elementType: {
    required: {
      en: 'Element type is required',
      ru: 'Необходимо указать тип элемента',
    },
    invalidValue: {
      en: 'Element type not supported',
      ru: 'Тип элемента не поддерживается',
    },
  },
  draggable: {
    required: {
      en: 'Draggable flag is required',
      ru: 'Необходимо указать, можно ли перемещать элемент',
    },
    invalidType: {
      en: 'Draggable must be a boolean',
      ru: 'Параметр перемещения должен иметь значение "да" или "нет"',
    },
  },
  dragDistance: {
    required: {
      en: 'Drag distance is required',
      ru: 'Необходимо указать дистанцию перемещения',
    },
    invalidType: {
      en: 'Drag distance must be a number',
      ru: 'Дистанция перемещения должна быть числом',
    },
  },
  x: {
    required: {
      en: 'X coordinate is required',
      ru: 'Необходимо указать координату X',
    },
    invalidType: {
      en: 'X coordinate must be a number',
      ru: 'Координата X должна быть числом',
    },
  },
  y: {
    required: {
      en: 'Y coordinate is required',
      ru: 'Необходимо указать координату Y',
    },
    invalidType: {
      en: 'Y coordinate must be a number',
      ru: 'Координата Y должна быть числом',
    },
  },
  rotation: {
    required: {
      en: 'Rotation angle is required',
      ru: 'Необходимо указать угол поворота',
    },
    invalidType: {
      en: 'Rotation angle must be a number',
      ru: 'Угол поворота должен быть числом',
    },
  },
  fill: {
    required: {
      en: 'Fill color is required',
      ru: 'Необходимо указать цвет заливки',
    },
    invalidType: {
      en: 'Fill color must be a string',
      ru: 'Цвет заливки должен быть строкой',
    },
    invalidFormat: {
      en: 'Fill color must be a valid HEX/RGB color',
      ru: 'Цвет заливки должен быть в формате HEX или RGB',
    },
  },
  stroke: {
    required: {
      en: 'Stroke color is required',
      ru: 'Необходимо указать цвет обводки',
    },
    invalidType: {
      en: 'Stroke color must be a string',
      ru: 'Цвет обводки должен быть строкой',
    },
    invalidFormat: {
      en: 'Stroke color must be a valid HEX/RGB color',
      ru: 'Цвет обводки должен быть в формате HEX или RGB',
    },
  },
  strokeWidth: {
    required: {
      en: 'Stroke width is required',
      ru: 'Необходимо указать толщину обводки',
    },
    invalidType: {
      en: 'Stroke width must be a number',
      ru: 'Толщина обводки должна быть числом',
    },
  },
  cornerRadius: {
    required: {
      en: 'Corner radius is required',
      ru: 'Необходимо указать радиус скругления углов',
    },
    invalidType: {
      en: 'Corner radius must be a number',
      ru: 'Радиус скругления углов должен быть числом',
    },
  },
  width: {
    required: {
      en: 'Width is required',
      ru: 'Необходимо указать ширину',
    },
    invalidType: {
      en: 'Width must be a number',
      ru: 'Ширина должна быть числом',
    },
  },
  height: {
    required: {
      en: 'Height is required',
      ru: 'Необходимо указать высоту',
    },
    invalidType: {
      en: 'Height must be a number',
      ru: 'Высота должна быть числом',
    },
  },
  svg: {
    required: {
      en: 'SVG data is required for text elements',
      ru: 'Для текстовых элементов необходимы SVG-данные',
    },
    invalidType: {
      en: 'SVG data must be a string',
      ru: 'SVG-данные должны быть строкой',
    },
  },
  content: {
    required: {
      en: 'Content is required for text elements',
      ru: 'Для текстовых элементов необходимо указать содержание',
    },
    invalidType: {
      en: 'Content must be a string',
      ru: 'Содержание должно быть строкой',
    },
  },
  points: {
    required: {
      en: 'Points array is required for lines/markers',
      ru: 'Для линий и маркеров необходим массив точек',
    },
    invalidType: {
      en: 'Points must be an array',
      ru: 'Точки должны быть указаны в виде массива',
    },
    invalidArrayItems: {
      en: 'All points must be numbers',
      ru: 'Все точки должны быть числами',
    },
    invalidLength: {
      en: 'Points array must contain at least 2 values',
      ru: 'Массив точек должен содержать минимум 2 значения',
    },
  },
  opacity: {
    required: {
      en: 'Opacity is required',
      ru: 'Необходимо указать прозрачность',
    },
    invalidType: {
      en: 'Opacity must be a number',
      ru: 'Прозрачность должна быть числом',
    },
    invalidRange: {
      en: 'Opacity must be between 0 and 1',
      ru: 'Прозрачность должна быть в диапазоне от 0 до 1',
    },
  },
} as const;

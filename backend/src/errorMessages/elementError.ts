export const elementError = {
  element: {
    required: {
      en: 'Element data is required',
      ru: 'Данные элемента являются обязательными',
    },
    invalidType: {
      en: 'Invalid element type',
      ru: 'Неверный тип элемента',
    },
  },
  elementId: {
    invalidType: {
      en: 'ID must be a string',
      ru: 'ID должен быть строкой',
    },
  },
  elementType: {
    required: {
      en: 'Element type is required',
      ru: 'Тип элемента является обязательным',
    },
    invalidValue: {
      en: 'Element type must be one of: rect, ellipse, text, line, marker',
      ru: 'Тип элемента должен быть одним из: rect, ellipse, text, line, marker',
    },
  },
  draggable: {
    required: {
      en: 'Draggable flag is required',
      ru: 'Флаг перетаскивания является обязательным',
    },
    invalidType: {
      en: 'Draggable must be a boolean',
      ru: 'Флаг перетаскивания должен быть true/false',
    },
  },
  dragDistance: {
    required: {
      en: 'Drag distance is required',
      ru: 'Дистанция перетаскивания является обязательной',
    },
    invalidType: {
      en: 'Drag distance must be a number',
      ru: 'Дистанция перетаскивания должна быть числом',
    },
  },
  x: {
    required: {
      en: 'X coordinate is required',
      ru: 'Координата X является обязательной',
    },
    invalidType: {
      en: 'X coordinate must be a number',
      ru: 'Координата X должна быть числом',
    },
  },
  y: {
    required: {
      en: 'Y coordinate is required',
      ru: 'Координата Y является обязательной',
    },
    invalidType: {
      en: 'Y coordinate must be a number',
      ru: 'Координата Y должна быть числом',
    },
  },
  rotation: {
    required: {
      en: 'Rotation angle is required',
      ru: 'Угол поворота является обязательным',
    },
    invalidType: {
      en: 'Rotation angle must be a number',
      ru: 'Угол поворота должен быть числом',
    },
  },
  fill: {
    required: {
      en: 'Fill color is required',
      ru: 'Цвет заливки является обязательным',
    },
    invalidType: {
      en: 'Fill color must be a string',
      ru: 'Цвет заливки должен быть строкой',
    },
    invalidFormat: {
      en: 'Fill color must be a valid HEX/RGB color',
      ru: 'Цвет заливки должен быть в формате HEX/RGB',
    },
  },
  stroke: {
    required: {
      en: 'Stroke color is required',
      ru: 'Цвет обводки является обязательным',
    },
    invalidType: {
      en: 'Stroke color must be a string',
      ru: 'Цвет обводки должен быть строкой',
    },
    invalidFormat: {
      en: 'Stroke color must be a valid HEX/RGB color',
      ru: 'Цвет обводки должен быть в формате HEX/RGB',
    },
  },
  strokeWidth: {
    required: {
      en: 'Stroke width is required',
      ru: 'Толщина обводки является обязательной',
    },
    invalidType: {
      en: 'Stroke width must be a number',
      ru: 'Толщина обводки должна быть числом',
    },
  },
  cornerRadius: {
    required: {
      en: 'Corner radius is required for rectangles',
      ru: 'Радиус скругления углов обязателен для прямоугольников',
    },
    invalidType: {
      en: 'Corner radius must be a number',
      ru: 'Радиус скругления углов должен быть числом',
    },
  },
  width: {
    required: {
      en: 'Width is required',
      ru: 'Ширина является обязательной',
    },
    invalidType: {
      en: 'Width must be a number',
      ru: 'Ширина должна быть числом',
    },
  },
  height: {
    required: {
      en: 'Height is required',
      ru: 'Высота является обязательной',
    },
    invalidType: {
      en: 'Height must be a number',
      ru: 'Высота должна быть числом',
    },
  },
  svg: {
    required: {
      en: 'SVG data is required for text elements',
      ru: 'SVG-данные обязательны для текстовых элементов',
    },
    invalidType: {
      en: 'SVG data must be a string',
      ru: 'SVG-данные должны быть строкой',
    },
  },
  content: {
    required: {
      en: 'Content is required for text elements',
      ru: 'Содержание обязательно для текстовых элементов',
    },
    invalidType: {
      en: 'Content must be a string',
      ru: 'Содержание должно быть строкой',
    },
  },
  points: {
    required: {
      en: 'Points array is required for lines/markers',
      ru: 'Массив точек обязателен для линий/маркеров',
    },
    invalidType: {
      en: 'Points must be an array',
      ru: 'Точки должны быть массивом',
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
      en: 'Opacity is required for markers',
      ru: 'Прозрачность обязательна для маркеров',
    },
    invalidType: {
      en: 'Opacity must be a number',
      ru: 'Прозрачность должна быть числом',
    },
    invalidRange: {
      en: 'Opacity must be between 0 and 1',
      ru: 'Прозрачность должна быть между 0 и 1',
    },
  },
} as const;

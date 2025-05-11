import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { Layer, LayerDocument } from './schemas/layer.schema';
import {
  BaseElementModel,
  BaseElementSchema,
  EllipseElementSchema,
  LineElementSchema,
  MarkerElementSchema,
  RectElementSchema,
  TextElementSchema,
} from './schemas/element.schema';
import { UpdateElementDto } from './dto/update-element.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { CustomException } from '../exceptions/custom-exception';
import { getErrorMessages } from '../errorMessages/errorMessages';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Layer.name) private layerModel: Model<LayerDocument>,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<BoardDocument> {
    await this.validateBoardData(createBoardDto);
    try {
      const createdBoard = await this.boardModel.create(createBoardDto);

      const layers = await this.createLayers(createdBoard._id);
      createdBoard.layers = layers.map((layer) => layer._id);
      await createdBoard.save();

      return createdBoard;
    } catch {
      throw new CustomException(
        getErrorMessages({ board: 'creationFailed' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Partial<BoardDocument>[]> {
    if (process.env.NODE_ENV !== 'development') {
      throw new CustomException(
        getErrorMessages({ general: 'devOnly' }),
        HttpStatus.FORBIDDEN,
      );
    }
    return this.boardModel
      .find()
      .select('-__v')
      .limit(100)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(boardId: Types.ObjectId): Promise<BoardDocument> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new CustomException(
        getErrorMessages({ board: 'invalidIdType' }),
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.boardModel
      .findById(boardId)
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ board: 'idNotFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .exec();
  }

  async deleteById(boardId: Types.ObjectId): Promise<void> {
    const board = await this.findById(boardId);

    await this.layerModel.deleteMany({ boardId: board._id }).exec();

    const result = await this.boardModel.deleteOne({ _id: boardId }).exec();

    if (result.deletedCount === 0) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addElement(
    boardId: Types.ObjectId,
    layerNumber: number = 2,
    createElementDto: any,
  ): Promise<any> {
    const board = await this.findById(boardId);
    const layerId = board.layers[layerNumber];

    if (!layerId) {
      throw new NotFoundException(
        `Layer with number "${layerNumber}" not found`,
      );
    }

    const layer = await this.layerModel.findById(layerId).exec();
    if (!layer) {
      throw new NotFoundException(`Layer with ID "${layerId}" not found`);
    }

    if (!(await this.isElementIdUnique(boardId, createElementDto.id))) {
      throw new BadRequestException(
        `Element with ID "${createElementDto.id}" already exists in board "${boardId}"`,
      );
    }

    let element;
    switch (createElementDto.type) {
      case 'rect':
        element = new BaseElementModel.discriminators.rect(createElementDto);
        break;
      case 'ellipse':
        element = new BaseElementModel.discriminators.ellipse(createElementDto);
        break;
      case 'text':
        element = new BaseElementModel.discriminators.text(createElementDto);
        break;
      case 'line':
        element = new BaseElementModel.discriminators.line(createElementDto);
        break;
      case 'marker':
        element = new BaseElementModel.discriminators.marker(createElementDto);
        break;
      default:
        throw new BadRequestException(
          `Unsupported element type: "${createElementDto.type}"`,
        );
    }

    layer.elements.push(element);
    await layer.save();
    return element;
  }

  public async removeElement(
    boardId: Types.ObjectId,
    elementId: string,
  ): Promise<{ message: string }> {
    const layer = await this.findLayerByElement(boardId, elementId);

    if (!layer) {
      throw new NotFoundException(
        `Element with ID "${elementId}" not found in board "${boardId}"`,
      );
    }

    layer.elements = layer.elements.filter((el) => el.id !== elementId);

    await layer.save();
    await this.updateAtBoard(boardId);

    return { message: 'Element successfully deleted' };
  }

  public async updateElement(
    boardId: Types.ObjectId,
    elementId: string,
    updateDto: UpdateElementDto,
  ): Promise<void> {
    const layer = await this.findLayerByElement(boardId, elementId);

    const elementIndex = layer.elements.findIndex(
      (elem) => elem.id === elementId,
    );
    if (elementIndex === -1) {
      throw new Error('Element not found');
    }
    const currentElement = layer.elements[elementIndex];
    const permittedUpdates = this.getPermittedUpdates(
      updateDto,
      currentElement.type,
    );

    if (Object.keys(permittedUpdates).length === 0) {
      throw new Error('No valid fields to update for this element type');
    }

    const updatedElement = {
      ...currentElement.toObject(),
      ...permittedUpdates,
    };

    layer.elements.splice(elementIndex, 1, updatedElement);

    await this.layerModel.updateOne(
      { _id: layer._id },
      { $set: { elements: layer.elements } },
    );
  }

  public async changeElementLayer(
    boardId: Types.ObjectId,
    elementId: string,
    action: 'back' | 'forward' | 'bottom' | 'top',
  ): Promise<void> {
    const board = await this.findById(boardId);
    const layers = await this.layerModel
      .find({ _id: { $in: board.layers } })
      .sort({ layerNumber: 1 })
      .exec();
    let currentLayerIndex = -1;
    let currentElementIndex = -1;

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const elementIndex = layers[layerIndex].elements.findIndex(
        (e) => e.id === elementId,
      );
      if (elementIndex !== -1) {
        currentLayerIndex = layerIndex;
        currentElementIndex = elementIndex;
        break;
      }
    }
    if (currentLayerIndex === -1 || currentElementIndex === -1) {
      throw new NotFoundException(
        `Element with ID "${elementId}" not found in board "${boardId}"`,
      );
    }

    const currentElement =
      layers[currentLayerIndex].elements[currentElementIndex];

    switch (action) {
      case 'back': {
        layers[currentLayerIndex].elements.splice(currentElementIndex, 1);
        let inserted = false;
        for (
          let targetLayerIndex = currentLayerIndex;
          targetLayerIndex >= 0;
          targetLayerIndex--
        ) {
          const targetLayer = layers[targetLayerIndex];
          const startIndex =
            targetLayerIndex === currentLayerIndex
              ? currentElementIndex - 1
              : targetLayer.elements.length - 1;

          if (startIndex >= 0) {
            targetLayer.elements.splice(startIndex, 0, currentElement);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          layers[0].elements.unshift(currentElement);
        }
        break;
      }
      case 'forward': {
        layers[currentLayerIndex].elements.splice(currentElementIndex, 1);
        let inserted = false;
        for (
          let targetLayerIndex = currentLayerIndex;
          targetLayerIndex < layers.length;
          targetLayerIndex++
        ) {
          const targetLayer = layers[targetLayerIndex];
          const startIndex =
            targetLayerIndex === currentLayerIndex
              ? currentElementIndex + 1
              : 0;

          if (startIndex < targetLayer.elements.length) {
            targetLayer.elements.splice(startIndex + 1, 0, currentElement);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          layers[layers.length - 1].elements.push(currentElement);
        }
        break;
      }
      case 'bottom': {
        layers[currentLayerIndex].elements.splice(currentElementIndex, 1);
        layers[0].elements.unshift(currentElement);
        break;
      }
      case 'top': {
        layers[currentLayerIndex].elements.splice(currentElementIndex, 1);
        layers[layers.length - 1].elements.push(currentElement);
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    await Promise.all(layers.map((layer) => layer.save()));
  }

  async getElementLayerIndex(
    layerIds: Types.ObjectId[],
    elementId: string,
  ): Promise<number> {
    for (let i = 0; i < layerIds.length; i++) {
      const layer = await this.layerModel.findById(layerIds[i]).exec();
      if (layer && layer.elements.some((element) => element.id === elementId)) {
        return i;
      }
    }
    throw new NotFoundException(
      `Element with ID "${elementId}" not found in any layer`,
    );
  }

  async updateBoardTitle(
    boardId: Types.ObjectId,
    updateBoardTitleDto: UpdateBoardDto,
  ): Promise<BoardDocument> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    board.name = updateBoardTitleDto.name;
    await board.save();
    await this.updateAtBoard(boardId);
    return board;
  }

  public async findLayerByElement(
    boardId: Types.ObjectId,
    elementId: string,
  ): Promise<LayerDocument> {
    const board = await this.findById(boardId);
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    const layerIds = board.layers;
    const layers = await this.layerModel
      .find({ _id: { $in: layerIds } })
      .exec();

    for (const layer of layers) {
      const element = layer.elements.find((el) => el.id === elementId);
      if (element) {
        return layer;
      }
    }
    throw new NotFoundException(
      `Element with ID "${elementId}" not found in board "${boardId}"`,
    );
  }

  private getPermittedUpdates(
    updateDto: UpdateElementDto,
    elementType: string,
  ): Partial<UpdateElementDto> {
    const baseFields = Object.keys(BaseElementSchema.paths);
    const discriminators: Record<string, mongoose.Schema> = {
      rect: RectElementSchema,
      ellipse: EllipseElementSchema,
      text: TextElementSchema,
      line: LineElementSchema,
      marker: MarkerElementSchema,
    };

    const typeSpecificFields = discriminators[elementType]?.paths
      ? Object.keys(discriminators[elementType].paths)
      : [];
    const allowedFields = [...baseFields, ...typeSpecificFields];

    return Object.keys(updateDto)
      .filter((key) => allowedFields.includes(key))
      .reduce((acc, key) => {
        acc[key] = updateDto[key];
        return acc;
      }, {} as Partial<UpdateElementDto>);
  }

  private async createLayers(
    boardId: Types.ObjectId,
    layerCount: number = 3,
  ): Promise<LayerDocument[]> {
    return Promise.all(
      Array.from({ length: layerCount }, (_, index) => {
        const layer = new this.layerModel({ boardId, layerNumber: index });
        return layer.save();
      }),
    );
  }

  private async validateBoardData(
    createBoardDto: CreateBoardDto,
  ): Promise<void> {
    const { sectionId, name } = createBoardDto;
    const boardExists = await this.boardModel.exists({ sectionId, name });

    if (boardExists) {
      throw new CustomException(
        getErrorMessages({ board: 'unique' }),
        HttpStatus.CONFLICT,
      );
    }
  }

  private async isElementIdUnique(
    boardId: Types.ObjectId,
    elementId: string,
  ): Promise<boolean> {
    const board = await this.findById(boardId);
    const duplicateExists = await this.layerModel.exists({
      _id: { $in: board.layers },
      'elements.id': elementId,
    });
    return !duplicateExists;
  }

  private async updateAtBoard(boardId: Types.ObjectId): Promise<void> {
    await this.boardModel
      .updateOne({ _id: boardId }, { $currentDate: { updatedAt: true } })
      .exec();
  }
}

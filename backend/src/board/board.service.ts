import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { Layer, LayerDocument } from './schemas/layer.schema';
import { BaseElement, BaseElementModel } from './schemas/element.schema';
import { UpdateElementDto } from './dto/update-element.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { CustomException } from '../exceptions/custom-exception';
import { getErrorMessages } from '../errorMessages';

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
    elementDto: any,
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

    if (!(await this.isElementIdUnique(boardId, elementDto.id))) {
      throw new BadRequestException(
        `Element with ID "${elementDto.id}" already exists in board "${boardId}"`,
      );
    }

    let element;
    switch (elementDto.type) {
      case 'rect':
        element = new BaseElementModel.discriminators.rect(elementDto);
        break;
      case 'ellipse':
        element = new BaseElementModel.discriminators.ellipse(elementDto);
        break;
      case 'text':
        element = new BaseElementModel.discriminators.text(elementDto);
        break;
      case 'line':
        element = new BaseElementModel.discriminators.line(elementDto);
        break;
      case 'marker':
        element = new BaseElementModel.discriminators.marker(elementDto);
        break;
      default:
        throw new BadRequestException(
          `Unsupported element type: "${elementDto.type}"`,
        );
    }

    layer.elements.push(element);
    await layer.save();
    return element;
  }

  async removeElement(elementId: string): Promise<{ message: string }> {
    const { layer } = await this.findLayerAndElementById(elementId);

    const elementIndex = layer.elements.findIndex(
      (element) => element.id === elementId,
    );
    if (elementIndex === -1) {
      throw new NotFoundException(`Element with ID "${elementId}" not found`);
    }

    layer.elements.splice(elementIndex, 1);
    await layer.save();
    await this.updateAtBoard(layer.boardId);
    return { message: 'Element successfully deleted' };
  }

  async updateElement(
    elementId: string,
    updateDto: UpdateElementDto,
  ): Promise<BaseElement> {
    const { layer, element } = await this.findLayerAndElementById(elementId);

    if ((updateDto as any).type || (updateDto as any).id) {
      throw new BadRequestException('Cannot update type or id of the element');
    }

    Object.assign(element, updateDto);
    await layer.save();
    await this.updateAtBoard(layer.boardId);
    return element;
  }

  async moveElementToLayer(
    boardId: Types.ObjectId,
    elementId: string,
    direction: 'up' | 'down',
  ): Promise<BaseElement> {
    const board = await this.findById(boardId);
    const currentLayerIndex = await this.getElementLayerIndex(
      board.layers,
      elementId,
    );
    const targetLayerIndex =
      direction === 'up' ? currentLayerIndex - 1 : currentLayerIndex + 1;

    if (targetLayerIndex < 0 || targetLayerIndex >= board.layers.length) {
      throw new BadRequestException(
        `Cannot move element "${elementId}" ${direction} from layer "${currentLayerIndex}"`,
      );
    }

    const currentLayer = await this.layerModel
      .findById(board.layers[currentLayerIndex])
      .exec();
    const targetLayer = await this.layerModel
      .findById(board.layers[targetLayerIndex])
      .exec();

    if (!currentLayer || !targetLayer) {
      throw new NotFoundException(`Layer not found`);
    }

    const elementIndex = currentLayer.elements.findIndex(
      (element) => element.id === elementId,
    );
    const [element] = currentLayer.elements.splice(elementIndex, 1);

    if (direction === 'up') {
      targetLayer.elements.push(element);
    } else {
      targetLayer.elements.unshift(element);
    }

    await currentLayer.save();
    await targetLayer.save();
    await this.updateAtBoard(boardId);
    return element;
  }

  async moveElementWithinLayer(
    elementId: string,
    direction: 'up' | 'down',
  ): Promise<BaseElement> {
    const { layer, elementIndex } =
      await this.findLayerAndElementIndexById(elementId);

    if (direction === 'up' && elementIndex > 0) {
      [layer.elements[elementIndex - 1], layer.elements[elementIndex]] = [
        layer.elements[elementIndex],
        layer.elements[elementIndex - 1],
      ];
    } else if (
      direction === 'down' &&
      elementIndex < layer.elements.length - 1
    ) {
      [layer.elements[elementIndex + 1], layer.elements[elementIndex]] = [
        layer.elements[elementIndex],
        layer.elements[elementIndex + 1],
      ];
    } else {
      return this.moveElementToLayer(layer.boardId, elementId, direction);
    }

    await layer.save();
    await this.updateAtBoard(layer.boardId);
    return layer.elements[elementIndex];
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

  private async createLayers(
    boardId: Types.ObjectId,
  ): Promise<LayerDocument[]> {
    return Promise.all(
      Array.from({ length: 3 }, (_, index) => {
        const layer = new this.layerModel({ boardId, layerNumber: index });
        return layer.save();
      }),
    );
  }

  private async validateBoardData(
    createBoardDto: CreateBoardDto,
  ): Promise<void> {
    const { sectionId, name } = createBoardDto;

    const existingBoard = await this.boardModel
      .findOne({ sectionId, name })
      .exec();

    if (existingBoard) {
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
    for (const layerId of board.layers) {
      const layer = await this.layerModel.findById(layerId).exec();
      if (layer && layer.elements.some((element) => element.id === elementId)) {
        return false;
      }
    }
    return true;
  }

  private async findLayerAndElementById(
    elementId: string,
  ): Promise<{ layer: LayerDocument; element: BaseElement }> {
    const layers = await this.layerModel.find().exec();
    for (const layer of layers) {
      const element = layer.elements.find(
        (element) => element.id === elementId,
      );
      if (element) {
        return { layer, element };
      }
    }
    throw new NotFoundException(`Element with ID "${elementId}" not found`);
  }

  private async findLayerAndElementIndexById(
    elementId: string,
  ): Promise<{ layer: LayerDocument; elementIndex: number }> {
    const layers = await this.layerModel.find().exec();
    for (const layer of layers) {
      const elementIndex = layer.elements.findIndex(
        (element) => element.id === elementId,
      );
      if (elementIndex !== -1) {
        return { layer, elementIndex };
      }
    }
    throw new NotFoundException(`Element with ID "${elementId}" not found`);
  }

  private async updateAtBoard(boardId: Types.ObjectId): Promise<void> {
    await this.boardModel
      .updateOne({ _id: boardId }, { $currentDate: { updatedAt: true } })
      .exec();
  }
}

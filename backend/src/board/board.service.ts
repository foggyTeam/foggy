import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from './schemas/board.schema';
import { Layer } from './schemas/layer.schema';
import { BaseElement, BaseElementModel } from './schemas/element.schema';
import { UpdateElementDto } from './dto/update-element.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<Board>,
    @InjectModel(Layer.name) private layerModel: Model<Layer>,
  ) {}

  async createBoard(createBoardDto: any): Promise<Board> {
    const createdBoard = new this.boardModel(createBoardDto);

    const layers = await Promise.all([
      this.createLayer(createdBoard._id.toString(), 0),
      this.createLayer(createdBoard._id.toString(), 1),
      this.createLayer(createdBoard._id.toString(), 2),
    ]);

    createdBoard.layers = layers.map((layer) => layer._id.toString());
    return createdBoard.save();
  }

  async createLayer(boardId: string, layerNumber: number): Promise<Layer> {
    const layer = new this.layerModel({ boardId, layerNumber });
    return layer.save();
  }

  async findAll(): Promise<Board[]> {
    return this.boardModel.find().exec();
  }

  async findById(boardId: string): Promise<Board> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }
    return board;
  }

  async deleteById(boardId: string): Promise<void> {
    const board = await this.findById(boardId);

    await this.layerModel.deleteMany({ boardId: board._id }).exec();

    const result = await this.boardModel.deleteOne({ _id: boardId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }
  }

  async addElement(
    boardId: string,
    layerNumber: number,
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
    await this.updateLastChange(layer.boardId);
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
    await this.updateLastChange(layer.boardId);
    return element;
  }

  async moveElementToLayer(
    boardId: string,
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
    await this.updateLastChange(boardId);
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
    await this.updateLastChange(layer.boardId);
    return layer.elements[elementIndex];
  }

  async getElementLayerIndex(
    layerIds: string[],
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
    boardId: string,
    updateBoardTitleDto: UpdateBoardDto,
  ): Promise<Board> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    board.name = updateBoardTitleDto.name;
    await board.save();
    await this.updateLastChange(boardId);
    return board;
  }

  private async isElementIdUnique(
    boardId: string,
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
  ): Promise<{ layer: Layer; element: BaseElement }> {
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
  ): Promise<{ layer: Layer; elementIndex: number }> {
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

  private async updateLastChange(boardId: string): Promise<void> {
    const board = await this.boardModel.findById(boardId).exec();
    if (board) {
      board.lastChange = new Date();
      await board.save();
    }
  }
}

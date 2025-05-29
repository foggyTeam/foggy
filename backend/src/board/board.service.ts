import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Board, BoardDocument, BoardResponse } from './schemas/board.schema';
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
import { ProjectService } from '../projects/project.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Layer.name) private layerModel: Model<LayerDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<Types.ObjectId> {
    await this.validateBoardData(createBoardDto);
    try {
      const createdBoard = await this.boardModel.create(createBoardDto);

      const layers = await this.createLayers(createdBoard._id);
      createdBoard.layers = layers.map((layer) => layer._id);
      await createdBoard.save();

      await this.projectService.addBoardToSection(
        createdBoard.sectionId,
        createdBoard._id,
      );

      return createdBoard._id;
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

  async getBoard(boardId: Types.ObjectId): Promise<BoardResponse> {
    const board = await this.findById(boardId);
    const layers = await this.getBoardLayers(boardId);
    const parentPath = await this.projectService.getSectionPath(
      board.sectionId,
    );
    return {
      id: board._id,
      projectId: board.projectId,
      sectionIds: parentPath,
      name: board.name,
      type: board.type,
      layers: layers.map((layer) => ({
        layerNumber: layer.layerNumber,
        elements: layer.elements,
      })),
      updatedAt: board.updatedAt,
    };
  }

  async deleteByProject(projectId: Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new CustomException(
        getErrorMessages({ board: 'invalidIdType' }),
        HttpStatus.BAD_REQUEST,
      );
    }
    const boards = await this.boardModel.find({ projectId }).exec();
    if (boards.length === 0) {
      return;
    }
    await Promise.all(
      boards.map(async (board) => {
        await this.layerModel.deleteMany({ boardId: board._id }).exec();
        await this.projectService.removeBoardFromSection(
          board.sectionId,
          board._id,
        );
      }),
    );
    const result = await this.boardModel.deleteMany({ projectId }).exec();

    if (result.deletedCount === 0) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteById(
    boardId: Types.ObjectId,
    options?: { removeFromParent: boolean },
  ): Promise<void> {
    const board = await this.findById(boardId);
    const shouldRemoveFromParent = options?.removeFromParent !== false;
    if (shouldRemoveFromParent && board.sectionId) {
      await this.projectService.removeBoardFromSection(
        board.sectionId,
        boardId,
      );
    }
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
    try {
      switch (createElementDto.type) {
        case 'rect':
          element = new BaseElementModel.discriminators.rect(createElementDto);
          break;
        case 'ellipse':
          element = new BaseElementModel.discriminators.ellipse(
            createElementDto,
          );
          break;
        case 'text':
          element = new BaseElementModel.discriminators.text(createElementDto);
          break;
        case 'line':
          element = new BaseElementModel.discriminators.line(createElementDto);
          break;
        case 'marker':
          element = new BaseElementModel.discriminators.marker(
            createElementDto,
          );
          break;
        default:
          throw new BadRequestException(
            `Unsupported element type: "${createElementDto.type}"`,
          );
      }

      layer.elements.push(element);
      await layer.save();
      return element;
    } catch (error) {
      if (
        error.message.includes('BSON document too large') ||
        error.message.includes('document is larger than the maximum size')
      ) {
        throw new CustomException(
          getErrorMessages({ element: 'sizeLimit' }),
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }
      throw error;
    }
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

  public async changeBoardSection(
    boardId: Types.ObjectId,
    newSectionId: Types.ObjectId,
  ): Promise<void> {
    const board = await this.findById(boardId);
    const oldSectionId = board.sectionId;

    if (
      !newSectionId ||
      (oldSectionId && oldSectionId.toString() === newSectionId.toString())
    ) {
      return;
    }
    board.sectionId = newSectionId;
    await board.save();

    if (oldSectionId) {
      await this.projectService.removeBoardFromSection(oldSectionId, boardId);
    }
    await this.projectService.addBoardToSection(newSectionId, boardId);
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

  async deleteAll(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw new CustomException(
        getErrorMessages({ general: 'devOnly' }),
        HttpStatus.FORBIDDEN,
      );
    }

    await this.boardModel.deleteMany({}).exec();
    await this.layerModel.deleteMany({}).exec();
  }

  public async changeElementLayer(
    boardId: Types.ObjectId,
    elementId: string,
    prevPosition: { layer: number; index: number },
    newPosition: { layer: number; index: number },
  ): Promise<void> {
    const board = await this.findById(boardId);
    const layers = await this.layerModel
      .find({ _id: { $in: board.layers } })
      .sort({ layerNumber: 1 })
      .exec();

    if (
      prevPosition.layer < 0 ||
      prevPosition.layer >= layers.length ||
      newPosition.layer < 0 ||
      newPosition.layer >= layers.length
    ) {
      throw new Error('Invalid layer number');
    }

    const prevLayer = layers[prevPosition.layer];
    if (
      !prevLayer ||
      prevPosition.index < 0 ||
      prevPosition.index >= prevLayer.elements.length
    ) {
      throw new Error('Invalid previous position');
    }

    const element = prevLayer.elements[prevPosition.index];
    if (element.id !== elementId) {
      throw new Error('Element ID mismatch');
    }

    prevLayer.elements.splice(prevPosition.index, 1);
    const newLayer = layers[newPosition.layer];
    newLayer.elements.splice(newPosition.index, 0, element);

    if (prevLayer._id.equals(newLayer._id)) {
      await prevLayer.save();
    } else {
      await Promise.all([prevLayer.save(), newLayer.save()]);
    }
    await this.updateAtBoard(boardId);
  }

  async updateBoard(
    projectId: Types.ObjectId,
    boardId: Types.ObjectId,
    updateBoardTitleDto: UpdateBoardDto,
    userId: Types.ObjectId,
  ): Promise<void> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    board.name = updateBoardTitleDto.name;
    await board.save();
    await this.updateAtBoard(boardId);
  }

  private async findById(boardId: Types.ObjectId): Promise<BoardDocument> {
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

  private async getBoardLayers(
    boardId: Types.ObjectId,
  ): Promise<LayerDocument[]> {
    const board = await this.findById(boardId);
    const populatedBoard = await board.populate<{ layers: LayerDocument[] }>(
      'layers',
    );
    return populatedBoard.layers as LayerDocument[];
  }

  private async findLayerByElement(
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

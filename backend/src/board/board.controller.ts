import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BoardService } from './board.service';
import { Board, BoardDocument } from './schemas/board.schema';
import { BaseElement } from './schemas/element.schema';
import { UpdateElementDto } from './dto/update-element.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Types } from 'mongoose';
import { CreateBoardDto } from './dto/create-board.dto';
import { CustomException } from '../exceptions/custom-exception';
import { getErrorMessages } from '../errorMessages';

@ApiTags('boards')
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({
    status: 201,
    description: 'The board has been successfully created.',
    type: Board,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'The board already exists',
  })
  @ApiBody({
    description: 'Data for the new board',
    examples: {
      example1: {
        summary: 'Simple board example',
        value: {
          projectId: '680f9ca1d1c94a1d0f76e23c',
          sectionId: '680f9ca1d1c94a1d0f76e23e',
          name: 'Test Board',
          type: 'simple',
        },
      },
    },
  })
  async create(@Body() createBoardDto: CreateBoardDto): Promise<BoardDocument> {
    return this.boardService.createBoard(createBoardDto);
  }

  @Get('dev-only')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[DEV ONLY] Get all boards',
    description:
      'This endpoint is available only in development environment for debugging purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of boards.',
    type: [Board],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden in production environment',
  })
  async findAll(): Promise<Partial<BoardDocument>[]> {
    if (process.env.NODE_ENV !== 'development') {
      throw new CustomException(getErrorMessages({ general: 'devOnly' }));
    }
    return this.boardService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a board by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
    example: '68155ed60664ac3e46713d58',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the full board document',
    type: Board,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Board not found',
  })
  async findById(@Param('id') id: Types.ObjectId): Promise<BoardDocument> {
    return await this.boardService.findById(id);
  }

  @Put(':id/title')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the title of a board' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The board title has been successfully updated.',
    type: Board,
  })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  @ApiBody({
    description: 'Data for updating the board title',
    examples: {
      updateTitle: {
        summary: 'Update board title',
        value: {
          name: 'New Board Title',
        },
      },
    },
  })
  async updateBoardTitle(
    @Param('id') id: Types.ObjectId,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<BoardDocument> {
    return this.boardService.updateBoardTitle(id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a board by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The board has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  async deleteById(@Param('id') id: Types.ObjectId): Promise<void> {
    return this.boardService.deleteById(id);
  }

  @Post(':id/elements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an element to a layer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board',
    type: String,
  })
  @ApiQuery({
    name: 'layerNumber',
    description: 'Number of the layer to add the element to',
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: 'The element has been successfully added.',
    type: BaseElement,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Board or layer not found.' })
  @ApiBody({
    description: 'Data for the new element',
    examples: {
      rect: {
        summary: 'Rectangle element example',
        value: {
          id: '1',
          type: 'rect',
          draggable: true,
          dragDistance: 10,
          x: 10,
          y: 20,
          rotation: 0,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 1,
          cornerRadius: 5,
          width: 100,
          height: 50,
        },
      },
      ellipse: {
        summary: 'Ellipse element example',
        value: {
          id: '2',
          type: 'ellipse',
          draggable: true,
          dragDistance: 10,
          x: 30,
          y: 40,
          rotation: 0,
          fill: 'blue',
          stroke: 'black',
          strokeWidth: 1,
          width: 100,
          height: 50,
        },
      },
      text: {
        summary: 'Text element example',
        value: {
          id: '3',
          type: 'text',
          draggable: true,
          dragDistance: 10,
          x: 15,
          y: 25,
          rotation: 0,
          fill: 'black',
          stroke: 'none',
          strokeWidth: 0,
          svg: '<svg>...</svg>',
          content: 'Hello, World!',
          width: 100,
          height: 50,
        },
      },
      line: {
        summary: 'Line element example',
        value: {
          id: '4',
          type: 'line',
          draggable: true,
          dragDistance: 10,
          x: 5,
          y: 10,
          rotation: 0,
          fill: 'none',
          stroke: 'green',
          strokeWidth: 1,
          points: [0, 0, 50, 60],
          width: 50,
        },
      },
      marker: {
        summary: 'Marker element example',
        value: {
          id: '5',
          type: 'marker',
          draggable: true,
          dragDistance: 10,
          x: 10,
          y: 20,
          rotation: 0,
          fill: 'yellow',
          stroke: 'black',
          strokeWidth: 1,
          points: [0, 0, 30, 40],
          width: 30,
          opacity: 0.5,
        },
      },
    },
  })
  async addElement(
    @Param('id') id: Types.ObjectId,
    @Query('layerNumber') layerNumber: number,
    @Body() elementDto: any,
  ): Promise<BaseElement> {
    return this.boardService.addElement(id, layerNumber, elementDto);
  }

  @Delete(':id/elements/:elementId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an element from a layer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board',
    type: String,
  })
  @ApiParam({
    name: 'elementId',
    description: 'ID of the element to remove',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The element has been successfully removed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Board, layer, or element not found.',
  })
  async removeElement(
    @Param('id') id: string,
    @Param('elementId') elementId: string,
  ): Promise<{ message: string }> {
    return this.boardService.removeElement(elementId);
  }

  @Put(':id/elements/:elementId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an element in a layer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board',
    type: String,
  })
  @ApiParam({
    name: 'elementId',
    description: 'ID of the element to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The element has been successfully updated.',
    type: BaseElement,
  })
  @ApiResponse({
    status: 404,
    description: 'Board, layer, or element not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiBody({
    description: 'Data for updating the element',
    examples: {
      updateFill: {
        summary: 'Update fill color',
        value: {
          fill: 'green',
        },
      },
      updatePosition: {
        summary: 'Update position',
        value: {
          x: 50,
          y: 100,
        },
      },
      updateMultiple: {
        summary: 'Update multiple properties',
        value: {
          draggable: false,
          rotation: 45,
          stroke: 'blue',
        },
      },
    },
  })
  async updateElement(
    @Param('id') id: Types.ObjectId,
    @Param('elementId') elementId: string,
    @Body() updateDto: UpdateElementDto,
  ): Promise<BaseElement> {
    return this.boardService.updateElement(elementId, updateDto);
  }

  @Put(':id/elements/:elementId/move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move an element within a layer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board',
    type: String,
  })
  @ApiParam({
    name: 'elementId',
    description: 'ID of the element to move',
    type: String,
  })
  @ApiQuery({
    name: 'direction',
    description: 'Direction to move the element ("up" or "down")',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The element has been successfully moved.',
    type: BaseElement,
  })
  @ApiResponse({
    status: 404,
    description: 'Board, layer, or element not found.',
  })
  async moveElementWithinLayer(
    @Param('id') id: Types.ObjectId,
    @Param('elementId') elementId: string,
    @Query('direction') direction: 'up' | 'down',
  ): Promise<BaseElement> {
    return this.boardService.moveElementWithinLayer(elementId, direction);
  }

  @Put(':id/elements/:elementId/move-to-layer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move an element to another layer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the board',
    type: String,
  })
  @ApiParam({
    name: 'elementId',
    description: 'ID of the element to move',
    type: String,
  })
  @ApiQuery({
    name: 'direction',
    description:
      'Direction to move the element to another layer ("up" or "down")',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The element has been successfully moved to another layer.',
    type: BaseElement,
  })
  @ApiResponse({
    status: 404,
    description: 'Board, layer, or element not found.',
  })
  async moveElementToLayer(
    @Param('id') id: Types.ObjectId,
    @Param('elementId') elementId: string,
    @Query('direction') direction: 'up' | 'down',
  ): Promise<BaseElement> {
    return this.boardService.moveElementToLayer(id, elementId, direction);
  }
}

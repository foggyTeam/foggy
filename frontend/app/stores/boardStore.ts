import { action, makeAutoObservable, observable } from 'mobx';
import {
  Board,
  BoardElement,
  BoardTypes,
  TextElement,
} from '@/app/lib/types/definitions';
import UpdateTextElement from '@/app/lib/utils/updateTextElement';
import userStore from '@/app/stores/userStore';
import { Socket } from 'socket.io-client';
import openBoardSocketConnection, {
  socketAddEventListeners,
} from '@/app/lib/utils/boardSocketConnection';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';

class BoardStore {
  boardWebsocket: Socket | null = null;

  activeBoard: Board | undefined = undefined;

  positionsMap = observable.map<string, { layer: number; index: number }>();

  constructor() {
    makeAutoObservable(this, {
      activeBoard: observable,

      setActiveBoard: action,
      addElement: action,
      updateElement: action,
      changeElementLayer: action,
      removeElement: action,
    });
  }

  setActiveBoard = (board: any | undefined) => {
    if (!board) {
      this.activeBoard = board;
      this.disconnectSocket();
    } else {
      this.activeBoard = {
        ...board,
        layers: board.layers.map((layer: BoardElement[]) =>
          observable.array(layer.map((element) => observable(element))),
        ),
        lastChange: board.updatedAt,
        type: board.type.toUpperCase() as BoardTypes,
      } as Board;

      this.buildElementsMap();

      projectsStore.addRecentBoard(
        projectsStore.activeProject?.id || '',
        board.sectionId,
        board.id,
        board.name,
        board.type.toUpperCase() as BoardTypes,
      );
      this.connectSocket(this.activeBoard.id || '');
    }
  };
  buildElementsMap() {
    if (!this.activeBoard) return;

    this.positionsMap.clear();
    for (
      let layerIndex = 0;
      layerIndex < this.activeBoard.layers.length;
      layerIndex++
    ) {
      const layer = this.activeBoard.layers[layerIndex];
      for (let elementIndex = 0; elementIndex < layer.length; elementIndex++) {
        const element = layer[elementIndex];
        this.positionsMap.set(element.id, {
          layer: layerIndex,
          index: elementIndex,
        });
      }
    }
  }
  private reindexLayer(layer: number, startIndex = 0) {
    const elements = this.activeBoard?.layers?.[layer];
    if (!elements) return;
    for (let i = startIndex; i < elements.length; i++) {
      this.positionsMap.set(elements[i].id, { layer, index: i });
    }
  }
  getElementPosition(id: string) {
    const position = this.positionsMap.get(id);
    if (position) return position;
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.board.boardElementNotFound,
    });

    return { layer: -1, index: -1 };
  }

  connectSocket(boardId: string) {
    if (!userStore.user?.id) return;
    if (boardId) {
      this.boardWebsocket = openBoardSocketConnection(
        boardId,
        userStore.user.id,
      );

      if (this.boardWebsocket) socketAddEventListeners(this.boardWebsocket);
    } else
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.socket.socketConnectionError.title,
        description:
          settingsStore.t.toasts.socket.socketConnectionError.description,
      });
  }
  disconnectSocket() {
    if (this.boardWebsocket) {
      this.boardWebsocket.disconnect();
      this.boardWebsocket = null;
    }
  }

  // BOARD
  addElement = (newElement: BoardElement, external?: boolean) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      const lastLayer = this.activeBoard?.layers.length - 1;
      const lastIndex = this.activeBoard.layers[lastLayer].length;
      this.activeBoard.layers[lastLayer].push(observable(newElement) as any);

      this.positionsMap.set(newElement.id, {
        layer: lastLayer,
        index: lastIndex,
      });
      if (!external) this.boardWebsocket.emit('addElement', newElement);
    }
  };
  updateElement = (
    id: string,
    newAttrs: Partial<BoardElement>,
    external?: boolean,
  ) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      const { layer, index } = this.getElementPosition(id);
      const element = this.activeBoard.layers[layer][index];
      if (element.type === 'text') {
        Object.assign(
          this.activeBoard.layers[layer][index],
          UpdateTextElement(element, newAttrs as Partial<TextElement>),
        );
      } else {
        Object.assign(this.activeBoard.layers[layer][index], newAttrs);
      }

      if (!external)
        this.boardWebsocket.emit('updateElement', { id, newAttrs });
    }
  };
  changeElementLayer = (
    id: string,
    action: 'back' | 'forward' | 'bottom' | 'top',
  ): { layer: number; index: number } => {
    if (!this.activeBoard?.layers || !this.boardWebsocket)
      return { layer: -1, index: -1 };

    const { layer, index } = this.getElementPosition(id);
    const element = this.activeBoard.layers[layer][index];

    this.activeBoard.layers[layer].splice(index, 1);
    this.reindexLayer(layer, index);

    const maxMin = this.getMaxMinElementPositions();
    const firstNonEmptyLayer = maxMin.min.layer;
    const lastNonEmptyLayer = maxMin.max.layer;

    let targetLayer = layer;
    let targetIndex = index;

    switch (action) {
      case 'back': {
        if (layer === firstNonEmptyLayer && index === 0) {
          targetLayer = layer;
          targetIndex = 0;
          break;
        }
        if (index > 0) {
          targetIndex = index - 1;
        } else {
          let prevLayer = layer - 1;
          while (
            prevLayer >= 0 &&
            this.activeBoard.layers[prevLayer].length === 0
          )
            prevLayer--;
          targetLayer = prevLayer;
          const len = this.activeBoard.layers[targetLayer].length;
          targetIndex = len > 0 ? len - 1 : 0;
        }
        break;
      }

      case 'forward': {
        if (
          layer === lastNonEmptyLayer &&
          index === this.activeBoard.layers[layer].length
        ) {
          targetLayer = layer;
          targetIndex = this.activeBoard.layers[layer].length;
          break;
        }
        if (index < this.activeBoard.layers[layer].length) {
          targetIndex = index + 1;
        } else {
          let nextLayer =
            layer < this.activeBoard.layers.length - 1 ? layer + 1 : layer;
          while (
            nextLayer < this.activeBoard.layers.length - 1 &&
            this.activeBoard.layers[nextLayer].length === 0
          )
            nextLayer++;
          targetLayer = nextLayer;
          targetIndex = this.activeBoard.layers[targetLayer].length > 0 ? 1 : 0;
        }
        break;
      }

      case 'bottom': {
        targetLayer = firstNonEmptyLayer;
        targetIndex = 0;
        break;
      }

      case 'top': {
        targetLayer = lastNonEmptyLayer;
        targetIndex = this.activeBoard.layers[lastNonEmptyLayer].length;
        break;
      }
    }

    this.activeBoard.layers[targetLayer].splice(targetIndex, 0, element);
    this.reindexLayer(targetLayer, targetIndex);

    this.boardWebsocket.emit('changeElementLayer', {
      id: id,
      prevPosition: { layer, index },
      newPosition: { layer: targetLayer, index: targetIndex },
    });

    return { layer: targetLayer, index: targetIndex };
  };
  changeElementLayerSocket = (
    id: string,
    prevPosition: { layer: number; index: number },
    newPosition: { layer: number; index: number },
  ) => {
    if (!this.activeBoard) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.globalError,
      });
      return;
    }
    if (
      prevPosition.layer == newPosition.layer &&
      prevPosition.index == newPosition.index
    )
      return;
    try {
      const element =
        this.activeBoard.layers[prevPosition.layer][prevPosition.index];

      this.activeBoard.layers[prevPosition.layer].splice(prevPosition.index, 1);
      this.reindexLayer(prevPosition.layer, prevPosition.index);

      this.activeBoard.layers[newPosition.layer].splice(
        newPosition.index,
        0,
        element,
      );

      this.reindexLayer(newPosition.layer, newPosition.index);
    } catch (error) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.socket.socketDataError.title,
        description: settingsStore.t.toasts.socket.socketDataError.description,
      });
    }
  };
  removeElement = (id: string, external?: boolean) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      const { layer, index } = this.getElementPosition(id);
      this.activeBoard.layers[layer].splice(index, 1);
      this.positionsMap.delete(id);
      this.reindexLayer(layer, index);

      if (!external) this.boardWebsocket.emit('removeElement', id);
    }
  };

  getMaxMinElementPositions = (): {
    max: { layer: number; index: number };
    min: { layer: number; index: number };
  } => {
    const layers = this.activeBoard?.layers;
    if (!layers)
      return { max: { layer: -1, index: -1 }, min: { layer: -1, index: -1 } };

    let firstNonEmptyLayer = layers.findIndex((l) => l.length > 0);
    if (firstNonEmptyLayer === -1) firstNonEmptyLayer = 0;
    let lastNonEmptyLayer =
      layers.length - 1 - [...layers].reverse().findIndex((l) => l.length > 0);
    if (lastNonEmptyLayer === layers.length)
      lastNonEmptyLayer = layers.length - 1;

    return {
      max: {
        layer: lastNonEmptyLayer,
        index: layers[lastNonEmptyLayer].length - 1,
      },
      min: { layer: firstNonEmptyLayer, index: 0 },
    };
  };
}

const boardStore = new BoardStore();
export default boardStore;

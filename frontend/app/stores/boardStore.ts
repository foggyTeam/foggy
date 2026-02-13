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

  constructor() {
    makeAutoObservable(this, {
      activeBoard: observable,

      addElement: action,
      updateElement: action,
      changeElementLayer: action,
      removeElement: action,
      setActiveBoard: action,
    });
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
      this.activeBoard.layers[this.activeBoard?.layers.length - 1].push(
        newElement,
      );
      if (!external) this.boardWebsocket.emit('addElement', newElement);
    }
  };
  updateElement = (
    id: string,
    newAttrs: Partial<BoardElement>,
    external?: boolean,
  ) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      this.activeBoard.layers = this.activeBoard.layers.map(
        (layer: BoardElement[]) =>
          layer.map((element) => {
            if (!(element.id === id)) return element;
            if (!(element.type === 'text'))
              return { ...element, ...newAttrs } as BoardElement;

            return UpdateTextElement(element, newAttrs as Partial<TextElement>);
          }),
      );
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

    const layers = this.activeBoard.layers;
    const position = this.getElementLayer(id);
    if (position.index < 0 || position.layer < 0) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.boardElementNotFound,
      });
      return { layer: -1, index: -1 };
    }

    const element: BoardElement = layers[position.layer][position.index];
    layers[position.layer].splice(position.index, 1);

    layers[position.layer] = [...layers[position.layer]];

    const maxMin = this.getMaxMinElementPositions();
    const firstNonEmptyLayer = maxMin.min.layer;
    const lastNonEmptyLayer = maxMin.max.layer;

    let targetLayer = position.layer;
    let targetIndex = position.index;

    switch (action) {
      case 'back': {
        if (position.layer === firstNonEmptyLayer && position.index === 0) {
          targetLayer = position.layer;
          targetIndex = 0;
          break;
        }
        if (position.index > 0) {
          targetIndex = position.index - 1;
        } else {
          let prevLayer = position.layer - 1;
          while (prevLayer >= 0 && layers[prevLayer].length === 0) prevLayer--;
          targetLayer = prevLayer;
          const len = layers[targetLayer].length;
          targetIndex = len > 0 ? len - 1 : 0;
        }
        break;
      }

      case 'forward': {
        if (
          position.layer === lastNonEmptyLayer &&
          position.index === layers[position.layer].length
        ) {
          targetLayer = position.layer;
          targetIndex = layers[position.layer].length;
          break;
        }
        if (position.index < layers[position.layer].length) {
          targetIndex = position.index + 1;
        } else {
          let nextLayer =
            position.layer < layers.length - 1
              ? position.layer + 1
              : position.layer;
          while (
            nextLayer < layers.length - 1 &&
            layers[nextLayer].length === 0
          )
            nextLayer++;
          targetLayer = nextLayer;
          targetIndex = layers[targetLayer].length > 0 ? 1 : 0;
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
        targetIndex = layers[lastNonEmptyLayer].length;
        break;
      }
    }

    layers[targetLayer].splice(targetIndex, 0, element);
    if (targetLayer !== position.layer)
      layers[targetLayer] = [...layers[targetLayer]];

    this.boardWebsocket.emit('changeElementLayer', {
      id: id,
      prevPosition: position,
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
      this.activeBoard.layers[newPosition.layer].splice(
        newPosition.index,
        0,
        element,
      );
      this.activeBoard.layers[prevPosition.layer] = [
        ...this.activeBoard.layers[prevPosition.layer],
      ];
      this.activeBoard.layers[newPosition.layer] = [
        ...this.activeBoard.layers[newPosition.layer],
      ];
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
      this.activeBoard.layers = this.activeBoard.layers.map((layer) =>
        layer.filter((element) => element.id !== id),
      );
      if (!external) this.boardWebsocket.emit('removeElement', id);
    }
  };
  getElementLayer = (id: string): { layer: number; index: number } => {
    const currentIndex = { layer: -1, index: -1 };

    if (this.activeBoard?.layers)
      this.activeBoard?.layers.map((layer, layerIndex) => {
        const index = layer.findIndex((element) => element.id === id);
        if (index !== -1) {
          currentIndex.layer = layerIndex;
          currentIndex.index = index;
        }
      });

    return currentIndex;
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

  setActiveBoard = (board: any | undefined) => {
    if (!board) {
      this.activeBoard = board;
      this.disconnectSocket();
    } else {
      this.activeBoard = {
        ...board,
        layers: board.layers.map((layer: BoardElement[]) =>
          observable.array(layer),
        ),
        lastChange: board.updatedAt,
        type: board.type.toUpperCase() as BoardTypes,
      } as Board;

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
}

const boardStore = new BoardStore();
export default boardStore;

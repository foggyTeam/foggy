import {
  action,
  IObservableArray,
  makeAutoObservable,
  observable,
  reaction,
} from 'mobx';
import { SBoardElement, TextElement } from '@/app/lib/types/definitions';
import UpdateTextElement from '@/app/lib/utils/updateTextElement';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import boardStore from '@/app/stores/board/boardStore';
import { Socket } from 'socket.io-client';

const SimpleBoardEvents = [
  'elementAdded',
  'elementUpdated',
  'elementRemoved',
  'changeElementLayer',
];

let socketRef: Socket | null = null;

class SimpleBoardStore {
  boardLayers: IObservableArray<SBoardElement>[] | undefined;
  positionsMap = observable.map<string, { layer: number; index: number }>();

  private cleanupListeners: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this, {
      boardLayers: observable,

      setBoardLayers: action,
      addElement: action,
      updateElement: action,
      changeElementLayer: action,
      removeElement: action,
    });

    reaction(
      () => boardStore.boardWebsocket,
      (socket) => {
        this.cleanupListeners?.();
        this.cleanupListeners = null;
        socketRef = socket;

        if (!socket) return;
        if (boardStore.activeBoard?.type === 'SIMPLE') {
          this.socketAddEventListeners(socket);
          this.cleanupListeners = () => this.socketRemoveEventListeners(socket);
        }
      },
    );
  }

  // WEBSOCKET
  private socketAddEventListeners(socket: Socket) {
    if (!socket) return;

    socket.on('elementAdded', (newElement: SBoardElement) => {
      simpleBoardStore.addElement(newElement, true);
    });

    socket.on(
      'elementUpdated',
      (data: { id: string; newAttrs: Partial<SBoardElement> }) => {
        simpleBoardStore.updateElement(data.id, data.newAttrs, true);
      },
    );

    socket.on('elementRemoved', (id: string) =>
      simpleBoardStore.removeElement(id, true),
    );

    socket.on(
      'changeElementLayer',
      (data: {
        id: string;
        prevPosition: { layer: number; index: number };
        newPosition: { layer: number; index: number };
      }) =>
        simpleBoardStore.changeElementLayerSocket(
          data.id,
          data.prevPosition,
          data.newPosition,
        ),
    );
  }
  private socketRemoveEventListeners(socket: Socket) {
    for (const event of SimpleBoardEvents) socket.removeAllListeners(event);
  }
  private emitSocketEvent(event: string, data: any) {
    socketRef?.emit(event, data);
  }

  // GENERAL
  setBoardLayers(layers: SBoardElement[][] | undefined) {
    if (!layers) {
      this.boardLayers = undefined;
      this.positionsMap.clear();
      return;
    }
    this.boardLayers = layers.map((layer: SBoardElement[]) =>
      observable.array(layer.map((element) => observable(element))),
    );
    this.buildElementsMap();
  }

  buildElementsMap() {
    if (!this.boardLayers) return;

    this.positionsMap.clear();
    for (
      let layerIndex = 0;
      layerIndex < this.boardLayers.length;
      layerIndex++
    ) {
      const layer = this.boardLayers[layerIndex];
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
    const elements = this.boardLayers?.[layer];
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

  // CRUD
  addElement = (newElement: SBoardElement, external?: boolean) => {
    if (this.boardLayers) {
      const lastLayer = this.boardLayers.length - 1;
      const lastIndex = this.boardLayers[lastLayer].length;
      this.boardLayers[lastLayer].push(observable(newElement) as any);

      this.positionsMap.set(newElement.id, {
        layer: lastLayer,
        index: lastIndex,
      });
      if (!external) this.emitSocketEvent('addElement', newElement);
    }
  };
  updateElement = (
    id: string,
    newAttrs: Partial<SBoardElement>,
    external?: boolean,
  ) => {
    if (this.boardLayers) {
      const { layer, index } = this.getElementPosition(id);
      const element = this.boardLayers[layer][index];
      if (element.type === 'text') {
        Object.assign(
          this.boardLayers[layer][index],
          UpdateTextElement(element, newAttrs as Partial<TextElement>),
        );
      } else {
        Object.assign(this.boardLayers[layer][index], newAttrs);
      }

      if (!external) this.emitSocketEvent('updateElement', { id, newAttrs });
    }
  };
  changeElementLayer = (
    id: string,
    action: 'back' | 'forward' | 'bottom' | 'top',
  ): { layer: number; index: number } => {
    if (!this.boardLayers) return { layer: -1, index: -1 };

    const { layer, index } = this.getElementPosition(id);
    const element = this.boardLayers[layer][index];

    this.boardLayers[layer].splice(index, 1);
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
          while (prevLayer >= 0 && this.boardLayers[prevLayer].length === 0)
            prevLayer--;
          targetLayer = prevLayer;
          const len = this.boardLayers[targetLayer].length;
          targetIndex = len > 0 ? len - 1 : 0;
        }
        break;
      }

      case 'forward': {
        if (
          layer === lastNonEmptyLayer &&
          index === this.boardLayers[layer].length
        ) {
          targetLayer = layer;
          targetIndex = this.boardLayers[layer].length;
          break;
        }
        if (index < this.boardLayers[layer].length) {
          targetIndex = index + 1;
        } else {
          let nextLayer =
            layer < this.boardLayers.length - 1 ? layer + 1 : layer;
          while (
            nextLayer < this.boardLayers.length - 1 &&
            this.boardLayers[nextLayer].length === 0
          )
            nextLayer++;
          targetLayer = nextLayer;
          targetIndex = this.boardLayers[targetLayer].length > 0 ? 1 : 0;
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
        targetIndex = this.boardLayers[lastNonEmptyLayer].length;
        break;
      }
    }

    this.boardLayers[targetLayer].splice(targetIndex, 0, element);
    this.reindexLayer(targetLayer, targetIndex);

    this.emitSocketEvent('changeElementLayer', {
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
    if (!this.boardLayers) {
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
      const element = this.boardLayers[prevPosition.layer][prevPosition.index];

      this.boardLayers[prevPosition.layer].splice(prevPosition.index, 1);
      this.reindexLayer(prevPosition.layer, prevPosition.index);

      this.boardLayers[newPosition.layer].splice(newPosition.index, 0, element);

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
    if (this.boardLayers) {
      const { layer, index } = this.getElementPosition(id);
      this.boardLayers[layer].splice(index, 1);
      this.positionsMap.delete(id);
      this.reindexLayer(layer, index);

      if (!external) this.emitSocketEvent('removeElement', id);
    }
  };

  getMaxMinElementPositions = (): {
    max: { layer: number; index: number };
    min: { layer: number; index: number };
  } => {
    if (!this.boardLayers)
      return { max: { layer: -1, index: -1 }, min: { layer: -1, index: -1 } };

    let firstNonEmptyLayer = this.boardLayers.findIndex((l) => l.length > 0);
    if (firstNonEmptyLayer === -1) firstNonEmptyLayer = 0;
    let lastNonEmptyLayer =
      this.boardLayers.length -
      1 -
      [...this.boardLayers].reverse().findIndex((l) => l.length > 0);
    if (lastNonEmptyLayer === this.boardLayers.length)
      lastNonEmptyLayer = this.boardLayers.length - 1;

    return {
      max: {
        layer: lastNonEmptyLayer,
        index: this.boardLayers[lastNonEmptyLayer].length - 1,
      },
      min: { layer: firstNonEmptyLayer, index: 0 },
    };
  };
}

const simpleBoardStore = new SimpleBoardStore();
export default simpleBoardStore;

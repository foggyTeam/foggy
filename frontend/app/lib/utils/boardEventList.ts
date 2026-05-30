class LinkedListNode<T> {
  id: string;
  prevId: string | null;
  nextId: string | null;
  value: T;

  constructor(
    id: string,
    prevId: string | null,
    nextId: string | null,
    value: T,
  ) {
    this.id = id;
    this.prevId = prevId;
    this.nextId = nextId;
    this.value = value;
  }
}

export default class BoardEventList<T> {
  maxListSize: number;
  onEventRemoveAction: ((event: T) => void) | undefined;

  pointer: string | null = null;
  head: string | null = null; // last
  tail: string | null = null; // earliest
  list: Record<string, LinkedListNode<T>> = {};

  constructor(
    maxListSize: number = 128,
    onEventRemoveAction?: (event: T) => void,
  ) {
    this.maxListSize = maxListSize;
    this.onEventRemoveAction = onEventRemoveAction || undefined;
  }

  get hasNext() {
    if (!this.pointer) return false;
    const { nextId } = this.list[this.pointer];
    return !!nextId;
  }
  get hasPrev() {
    if (!this.pointer) return false;
    const { prevId } = this.list[this.pointer];
    return !!prevId;
  }
  get eventsList() {
    if (!this.tail) return { list: [], pointer: -1 };

    let node = this.list[this.tail];
    let i = 0;
    let pointer = i;
    const list = [node.value];
    while (node.nextId) {
      i++;
      node = this.list[node.nextId];
      list.push(node.value);
      if (this.pointer === node.id) pointer = i;
    }
    return { list, pointer };
  }

  private removeNode(id: string) {
    const { nextId, prevId, value } = this.list[id];
    if (nextId) {
      const nextNode = this.list[nextId];
      this.list[nextNode.id].prevId = prevId;
      if (prevId === null) this.tail = nextNode.id;
    }
    if (prevId) {
      const prevNode = this.list[prevId];
      this.list[prevNode.id].nextId = nextId;

      if (nextId === null) this.head = prevNode.id;
    }
    if (nextId === null && prevId === null) {
      this.tail = null;
      this.head = null;
    }

    this.onEventRemoveAction?.(value);
    delete this.list[id];
  }

  private removeAfterPointer() {
    if (!this.pointer) return;

    const pointerNode = this.list[this.pointer];
    while (pointerNode.nextId) this.removeNode(pointerNode.nextId);
    this.head = this.pointer;
  }

  push(event: T) {
    while (Object.keys(this.list).length >= this.maxListSize && this.tail)
      this.removeNode(this.tail);

    this.removeAfterPointer();

    const newId = `${Date.now().toString()}${Object.keys(this.list).length}`;
    this.list[newId] = new LinkedListNode<T>(newId, this.head, null, event);

    if (this.head) this.list[this.head].nextId = newId;
    if (!this.tail) this.tail = newId;
    this.head = newId;
    this.pointer = newId;
  }

  undo() {
    if (!this.pointer) return null;

    const pointerNode = this.list[this.pointer];
    this.pointer = pointerNode.prevId;

    return pointerNode.value;
  }
  redo() {
    if (!this.pointer && !this.tail) return null;

    if (!this.pointer) {
      this.pointer = this.tail;
    } else {
      const pointerNode = this.list[this.pointer];
      if (!pointerNode.nextId) return null;
      this.pointer = pointerNode.nextId;
    }

    return this.list[this.pointer!].value;
  }

  clearList() {
    this.list = {};
    this.pointer = null;
    this.head = null;
    this.tail = null;
  }
}

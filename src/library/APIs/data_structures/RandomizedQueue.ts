import { UtilRandom } from "../Random";

class RandomizedQueue<Item> /* implements Iterable<Item> */ {

    private _queue: Item[] = [];
    private _size = 0;

    // construct an empty randomized queue
    public RandomizedQueue() {
        
    }

    // Construct a filled queue from an array
    // public RandomizedQueue(Item[] array) {
    //     this();

    // }

    // is the randomized queue empty?
    public isEmpty(): boolean { return this._size == 0; }

    // return the number of items on the randomized queue
    public get size(): number { return this._size; }

    // add the item
    public enqueue(item: Item): void {

        if (item == null) throw new TypeError("Argument must not be null");
        this._queue[this._size++] = item;
    }

    // remove and return a random item
    public dequeue(): Item {
        if (this.isEmpty()) throw new TypeError("No such element")
        let randIndex = this.randomAvailableIndex();
        let item = this._queue[randIndex];
        this._queue[randIndex] = this._queue[this._size - 1];
        // this._queue[this._size - 1] = null; // Left over code from java implementation: supposed to free up space, not sure if js does that automatically
        this._size--;
        return item;
    }

    // return a random item (but do not remove it)
    public sample(): Item {
        if (this.isEmpty()) throw new TypeError("No such element")
        return this._queue[this.randomAvailableIndex()];
    }

    private randomAvailableIndex(): number { return UtilRandom.uniformInt(this._size); }

    // NOTE: Java lab doesnt support iterables for some reason, so this whole thing right here is useless
    // return an independent iterator over items in random order
    // public Iterator<Item> iterator() { return new QueueIterator(); }

    // private class QueueIterator implements Iterator<Item> {

    //     private Item[] items;
    //     private int current = 0;

    //     public QueueIterator() {
    //         items = (Item[]) new Object[size];
    //         for (int i = 0; i < size; i++) 
    //             items[i] = queue[i];
    //         UtilRandom.shuffle(items);
    //     }

    //     public boolean hasNext() { return current < size; }

    //     public Item next() {

    //         if (!hasNext()) { throw new NoSuchElementException(); }

    //         return items[current++];
    //     }

    //     public void remove() { throw new UnsupportedOperationException(); }
    // }

}
export default class ByteField {

    constructor(buffer, byteOffset) {

        this.buffer = buffer;
        this.byteOffset = byteOffset;

    }

    get value() {
        return this.buffer.getUint8(this.byteOffset);
    }

    set value(v) {
        this.buffer.setUint8(this.byteOffset, v);
    }

    increment() {
        this.value = (this.value + 1) & 0xFF;
    }

    decrement() {
        this.value = (this.value - 1) & 0xFF;
    }

    clear() {
        this.value = 0;
    }

}
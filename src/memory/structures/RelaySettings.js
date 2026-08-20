import ByteField from "../utils/ByteField";

export default class RelaySettings {

    constructor(buffer, offset) {

        this.buffer = buffer;
        this.offset = offset;

        this._relayMode = new ByteField(buffer, offset);
        this._relayState = new ByteField(buffer, offset + 1);
        this._relayTime = new ByteField(buffer, offset + 2);

    }

    //----------------------------------
    // Relay Mode
    //----------------------------------

    get relayMode() {
        return this._relayMode.value !== 0;
    }

    set relayMode(value) {
        this._relayMode.value = value ? 1 : 0;
    }

    //----------------------------------
    // Relay State
    //----------------------------------

    get relayState() {
        return this._relayState.value !== 0;
    }

    set relayState(value) {
        this._relayState.value = value ? 1 : 0;
    }

    //----------------------------------
    // Relay Time
    //----------------------------------

    get relayTime() {
        return this._relayTime.value;
    }

    set relayTime(value) {
        this._relayTime.value = value;
    }

    //----------------------------------
    // Raw Bytes
    //----------------------------------

    get raw() {
        return this.buffer.getBytes(this.offset, 3);
    }

    set raw(bytes) {

        if (!(bytes instanceof Uint8Array) || bytes.length !== 3) {
            throw new Error("raw must be a Uint8Array(3).");
        }

        this.buffer.setBytes(this.offset, bytes);
    }

    //----------------------------------

    clear() {
        this._relayMode.clear();
        this._relayState.clear();
        this._relayTime.clear();
    }
}
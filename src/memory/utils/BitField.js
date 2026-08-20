export default class BitField {

    constructor(buffer, byteOffset, bitOffset, bitLength = 1) {

        this.buffer = buffer;
        this.byteOffset = byteOffset;
        this.bitOffset = bitOffset;
        this.bitLength = bitLength;

    }

    get value() {

        let value = 0;

        for (let i = 0; i < this.bitLength; i++) {

            const absoluteBit = this.bitOffset + i;

            const byteOffset =
                this.byteOffset + Math.floor(absoluteBit / 8);

            const bit =
                absoluteBit % 8;

            const bitValue =
                (this.buffer.getUint8(byteOffset) >> bit) & 1;

            value |= bitValue << i;

        }

        return value;

    }

    set value(v) {

        for (let i = 0; i < this.bitLength; i++) {

            const absoluteBit = this.bitOffset + i;

            const byteOffset =
                this.byteOffset + Math.floor(absoluteBit / 8);

            const bit =
                absoluteBit % 8;

            let b = this.buffer.getUint8(byteOffset);

            if ((v >> i) & 1)
                b |= (1 << bit);
            else
                b &= ~(1 << bit);

            this.buffer.setUint8(byteOffset, b);

        }

    }

    get boolean() {
        return this.value !== 0;
    }

    set boolean(v) {
        this.value = v ? 1 : 0;
    }

}
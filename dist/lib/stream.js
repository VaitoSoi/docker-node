/* eslint-disable @typescript-eslint/naming-convention */
import { Duplex } from 'node:stream';
export class DockerStream extends Duplex {
    socket;
    buffer;
    constructor(socket) {
        super();
        this.socket = socket;
        this.buffer = Buffer.alloc(0);
        socket.on('data', this._data.bind(this));
        socket.on("end", () => this.push(null));
        socket.on("error", (err) => this.destroy(err));
    }
    _data(chunk) {
        this.buffer = Buffer.concat([this.buffer, chunk], this.buffer.length + chunk.length);
        while (this.buffer.length >= 8) {
            const type = this.buffer.at(0);
            const length = this.buffer.readUInt32BE(4);
            if (this.buffer.length < 8 + length)
                break;
            const data = this.buffer.subarray(8, length + 8);
            this.push(data);
            if (type == 0)
                this.emit("stdin", data);
            else if (type == 1)
                this.emit("stdout", data);
            else if (type == 2)
                this.emit("stderr", data);
            else
                this.emit("unknown", data);
            this.buffer = this.buffer.subarray(8 + length);
            if (!this.buffer.length)
                this.buffer = Buffer.alloc(0);
        }
        ;
    }
    _read(size) {
    }
    _write(chunk, encoding, callback) {
        if (!this.socket.writable)
            return callback(new Error("Socket closed"));
        return this.socket.write(chunk, encoding, callback);
    }
    _final(callback) {
        if (this.socket.writable)
            this.socket.end();
        return callback();
    }
    _destroy(error, callback) {
        console.error(error);
        console.log("killed");
        try {
            if (!this.socket.closed)
                this.socket.end(callback);
        }
        catch (err) {
            callback(err);
        }
    }
}
export class ReadOnlyDockerStream extends DockerStream {
    _write(chunk, encoding, callback) {
    }
}
//# sourceMappingURL=stream.js.map
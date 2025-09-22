import { Duplex } from 'node:stream';
import { Socket } from 'node:net';
export declare class DockerStream extends Duplex {
    private socket;
    private buffer;
    constructor(socket: Socket);
    private _data;
    _read(size: number): void;
    _write(chunk: Buffer, encoding: BufferEncoding, callback: (err?: Error | null) => void): boolean | void;
    _final(callback: () => void): void;
    _destroy(error: Error | null, callback: (error?: Error | null) => void): void;
}
export declare class ReadOnlyDockerStream extends DockerStream {
    _write(chunk: Buffer, encoding: BufferEncoding, callback: (err?: Error | null) => void): void;
}

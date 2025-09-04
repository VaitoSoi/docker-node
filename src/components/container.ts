import { AxiosError, type AxiosInstance } from "axios";
import type {
    InspectContainer,
    CreateContainer,
    CreateContainerOption,
    CreateContainerResponse,
    ListFilter,
    FilesystemChange,
    ContainerUsage,
    UpdateOption,
    UpdateResponse,
    PruneFilter,
    Prune,
    ListContainer
} from "../typing/container";
import {
    APIError,
    BadParameter,
    Conflict,
    ContainerNameIsUsed,
    ContainerNotFound,
    ContainerNotRunning,
    ContainerOrPathNotFound,
    ImageNotFound,
    InvalidContainerName,
    ReadOnlyPath
} from "../lib/error";
import fs from "node:fs";
import { Duplex } from "node:stream";
import http from "node:http";
import type { Socket } from "node:net";

export class Container<IsOnLinux extends boolean> {
    constructor(private api: AxiosInstance) { }

    /**
     * Returns a list of containers.
     * Note that it uses a different, smaller representation of a container than inspecting a single container.
     * 
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerList
     */
    public async list(options?: {
        /** Return all containers. By default, only running containers are shown. */
        all?: boolean,
        /** Return this number of most recently created containers, including non-running ones. */
        limit?: number,
        /** Return the size of container as fields `SizeRw` and `SizeRootFs` */
        size?: boolean,
        /** Filters to process on the container list */
        filter?: ListFilter
    }): Promise<ListContainer<IsOnLinux>[]> {
        options ||= {};
        options.all ||= false;
        options.size ||= false;

        try {
            const response = await this.api.get<ListContainer<IsOnLinux>[]>(
                "/v1.51/containers/json?" +
                `all=${options.all}&` +
                (options.limit ? `limit=${options.limit}&` : '') +
                `size=${options.size}&` +
                (options.filter ? JSON.stringify(options.filter) : "")
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 500)
                    throw new APIError(message);

            }
            throw error;
        }
    }

    /**
     * Create a container
     * @param option Container to create 
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerCreate
     */
    public async create(option: CreateContainerOption): Promise<CreateContainerResponse> {
        if (option.Name && !/^\/?[a-zA-Z0-9][a-zA-Z0-9_.-]+$/.test(option.Name))
            throw new InvalidContainerName(option.Name);

        const body: CreateContainer = {
            Hostname: option.Hostname,
            Domainname: option.Domainname,
            User: option.User,
            AttachStdin: option.AttachStdin,
            AttachStdout: option.AttachStdout,
            AttachStderr: option.AttachStderr,
            ExposedPorts: option.ExposedPorts,
            Tty: option.Tty,
            OpenStdin: option.OpenStdin,
            StdinOnce: option.StdinOnce,
            Env: option.Env,
            Cmd: option.Cmd,
            HealthCheck: option.HealthCheck ? {
                Test: option.HealthCheck?.Test,
                Interval: option.HealthCheck?.Interval,
                Timeout: option.HealthCheck?.Timeout,
                Retries: option.HealthCheck?.Retries,
                StartPeriod: option.HealthCheck?.StartPeriod,
                StartInterval: option.HealthCheck?.StartInterval
            } : undefined,
            ArgsEscaped: option.ArgsEscaped,
            Image: option.Image,
            Volumes: option.Volumes,
            WorkingDir: option.WorkingDir,
            Entrypoint: option.Entrypoint,
            NetworkDisabled: option.NetworkDisabled,
            MacAddress: option.MacAddress,
            OnBuild: option.OnBuild,
            Labels: option.Labels,
            StopSignal: option.StopSignal,
            StopTimeout: option.StopTimeout,
            Shell: option.Shell,
        };

        try {
            const response = await this.api.put<CreateContainerResponse>(
                "/v1.51/containers/create?" +
                (option.Name ? `name=${option.Name}&` : "") +
                (option.Platform ? `platform=${option.Platform}` : ""),
                body
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ImageNotFound(option.Image);
                else if (error.status == 409)
                    throw new Conflict(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Return low-level information about a container.
     *
     * @param id ID or name of the container
     * @param size Return the size of container as fields `SizeRw` and `SizeRootFs`
     */
    public async inspect(
        id: string,
        size: boolean = false,
    ): Promise<InspectContainer<IsOnLinux>> {
        try {
            const response = await this.api.get<InspectContainer<IsOnLinux>>(`/v1.51/containers/${id}/json?size=${size}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * On Unix systems, this is done by running the ps command. This endpoint is not supported on Windows.
     * @param id ID or name of the container
     * @param ps_args The arguments to pass to `ps`. For example, `aux`.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerTop
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async top(id: string, ps_args: string = "-ef") {
        try {
            const response = await this.api.get(`/v1.51/containers/${id}/top?ps_args=${ps_args}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Returns which files in a container's filesystem have been added, deleted, or modified.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerChanges
     */
    public async getFilesystemChanges(id: string): Promise<FilesystemChange> {
        try {
            const response = await this.api.get<FilesystemChange>(`/v1.51/containers/${id}/changes`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Export the contents of a container as a tarball.
     * @param id ID or name of the container
     * @param path Where to save the tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerExport
     */
    public async export(id: string, path: string) {
        try {
            const reponse = await this.api.get(`/v1.51/containers/${id}/export`, { responseType: "stream" });
            const fileWriteStream = fs.createWriteStream(path);
            reponse.data.pipe(fileWriteStream);
            return new Promise<void>((resolve, reject) => {
                fileWriteStream.once('close', resolve);
                fileWriteStream.once('error', (error) => {
                    fileWriteStream.close();
                    reject(error);
                });
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Returns container’s resource usage statistics.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStats
     */
    public async stats(id: string): Promise<ContainerUsage<IsOnLinux>> {
        try {
            const response = await this.api.get<ContainerUsage<IsOnLinux>>(`/v1.51/containers/${id}/stats`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Start a container
     * 
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStart
     */
    public async start(id: string) {
        try {
            await this.api.post(`/v1.51/containers/${id}/start`);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status == 304)
                    return;

                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Stop a container
     * 
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @param timeout Number of seconds to wait before killing the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStop
     */
    public async stop(id: string, option?: { signal?: string, timeout?: number }) {
        try {
            await this.api.post(
                `/v1.51/containers/${id}/stop?` +
                (option?.signal ? `signal=${option?.signal}&` : '') +
                (option?.timeout ? `t=${option?.timeout}` : '')
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status == 304)
                    return;

                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Restart a container
     * 
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @param timeout Number of seconds to wait before killing the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRestart
     */
    public async restart(id: string, option?: {
        /** Signal to send to the container as an integer or string (e.g. `SIGINT`) */
        signal?: string,
        /** Number of seconds to wait before killing the container */
        timeout?: number
    }) {
        try {
            await this.api.post(
                `/v1.51/containers/${id}/restart?` +
                (option?.signal ? `signal=${option?.signal}&` : '') +
                (option?.timeout ? `t=${option?.timeout}` : '')
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Kill a container
     * 
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerKill
     */
    public async kill(id: string, signal?: string) {
        try {
            await this.api.post(
                `/v1.51/containers/${id}/kill?` +
                (signal ? `signal=${signal}&` : '')
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new ContainerNotRunning(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Change various configuration options of a container without having to recreate it.
     * @param id ID or name of the container
     * @param option 
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUpdate
     */
    public async update(id: string, option: UpdateOption<IsOnLinux>): Promise<UpdateResponse> {
        try {
            const response = await this.api.post<UpdateResponse>(`/v1.51/containers/${id}/update`, option);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Rename a container
     * 
     * @param id ID or name of the container
     * @param newName New name for the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRename
     */
    public async rename(id: string, newName: string) {
        try {
            await this.api.post(`/v1.51/containers/${id}/rename?name=${newName}&`);
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new ContainerNameIsUsed(newName);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Use the freezer cgroup to suspend all processes in a container.
     * 
     * Traditionally, when suspending a process the `SIGSTOP` signal is used, which is observable by the process being suspended. With the freezer cgroup the process is unaware, and unable to capture, that it is being suspended, and subsequently resumed.
     * 
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPause
     */
    public async pause(id: string) {
        try {
            await this.api.post(`/v1.51/containers/${id}/pause`);
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Resume a container which has been paused.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUnpause
     */
    public async unpause(id: string) {
        try {
            await this.api.post(`/v1.51/containers/${id}/unpause`);
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Block until a container stops, then returns the exit code.
     * @param id ID or name of the container
     * @param condition Wait until a container state reaches the given condition.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerWait
     */
    public async wait(id: string, condition: "not-running" | "next-exit" | "removed" = "not-running") {
        try {
            await this.api.post(`/v1.51/containers/${id}/wait?condition=${condition}`, {}, { timeout: 0 });
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Remove a container
     * @param id ID or name of the container
     * @param volume Remove anonymous volumes associated with the container.
     * @param force If the container is running, kill it before removing it.
     * @param link Remove the specified link associated with the container.
     */
    public async remove(id: string, option?: {
        /** Remove anonymous volumes associated with the container. */
        volume?: boolean,
        /** If the container is running, kill it before removing it. */
        force?: boolean,
        /** Remove the specified link associated with the container. */
        link?: boolean
    }) {
        try {
            await this.api.delete(
                `/v1.51/containers/${id}&` +
                (option?.volume ? `v=${option.volume}&` : "") +
                (option?.force ? `force=${option.force}&` : "") +
                (option?.link ? `link=${option.link}` : "")
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new Conflict(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Get information about files in a container
     * @param id ID or name of the container
     * @param path Resource in the container’s filesystem to archive.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchiveInfo
     */
    public async pathStat(id: string, path: string): Promise<object> {
        try {
            const response = await this.api.head(`/v1.51/containers/${id}/archive?path=${path}`);
            const rawData = response.headers["X-Docker-Container-Path-Stat"];
            const decodedData = Buffer.from(rawData, "base64").toString();
            return JSON.parse(decodedData);
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ContainerOrPathNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Get a tar archive of a resource in the filesystem of container id.
     * @param id ID or name of the container
     * @param containerPath Resource in the container’s filesystem to archive.
     * @param outputPath Where to save the tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchive
     */
    public async archive(id: string, containerPath: string, outputPath: string) {
        try {
            const reponse = await this.api.get(
                `/v1.51/containers/${id}/archive?path=${containerPath}`,
                { responseType: "stream" }
            );
            const fileWriteStream = fs.createWriteStream(outputPath);
            reponse.data.pipe(fileWriteStream);
            return new Promise<void>((resolve, reject) => {
                fileWriteStream.once('close', resolve);
                fileWriteStream.once('error', (error) => {
                    fileWriteStream.close();
                    reject(error);
                });
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ContainerOrPathNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Upload a tar archive to be extracted to a path in the filesystem of container id. `path` parameter is asserted to be a directory. If it exists as a file, 400 error will be returned with message "not a directory".
     * @param id ID or name of the container
     * @param inputPath Where to pick the directory
     * @param containerPath Path to a directory in the container to extract the archive’s contents into.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/PutContainerArchive
     */
    public async upload(
        id: string,
        inputPath: string,
        containerPath: string,
        option: {
            /** If `true` then it will be an error if unpacking the given content would cause an existing directory to be replaced with a non-directory and vice versa. */
            noOverwriteDirNonDir: boolean,
            /** If `true` then it will copy UID/GID maps to the dest file or dir */
            copyUIDGID: boolean
        }
    ) {
        try {
            const inputFileStream = fs.createReadStream(inputPath);
            await this.api.put(
                `/v1.51/containers/${id}/archive?path=${containerPath}&` +
                (option.copyUIDGID ? `copyUIDGID=${option.copyUIDGID}&` : '') +
                (option.noOverwriteDirNonDir ? `noOverwriteDirNonDir=${option.noOverwriteDirNonDir}` : ''),
                inputFileStream,
                { headers: { "Content-Type": "application/octet-stream" } }
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 403)
                    throw new ReadOnlyPath(message);
                else if (error.status == 404)
                    throw new ContainerOrPathNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Delete stopped containers
     * @param filters Filters
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPrune
     */
    public async prune(filters?: PruneFilter): Promise<Prune> {
        try {
            const response = await this.api.post<Prune>(
                `/v1.51/containers/prune?` +
                (filters ? `filter=${JSON.stringify(filters)}` : '')
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Attach to a container to read its output or send it input.
     * @param id ID or name of the container
     * @param option
     * @returns 
     */
    public async logs(id: string, option?: {
        /** 
         * Replay previous logs from the container.
         *
         * This is useful for attaching to a container that has started and you want to output everything since the container started.
         *
         * If stream is also enabled, once all the previous output has been returned, it will seamlessly transition into streaming current output.
         */
        logs?: boolean,
        /** Stream attached streams from the time the request was made onwards. */
        stream?: boolean,
        /** Attach to stdin */
        stdin?: boolean,
        /** Attach to stdout */
        stdout?: boolean,
        /** Attach to stderr */
        stderr?: boolean
    }): Promise<ContainerLogs> {
        return new Promise<ContainerLogs>((resolve, reject) => {
            const request = http.request(
                `${this.api.defaults.baseURL || ""}/v1.51/containers/${id}/attach?` +
                (option?.logs ? `logs=${option.logs}&` : '') +
                (option?.stream ? `stream=${option.stream}&` : '') +
                (option?.stdin ? `stdin=${option.stdin}&` : '') +
                (option?.stdout ? `stdout=${option.stdout}&` : '') +
                (option?.stderr ? `stderr=${option.stderr}` : ''),
                {
                    socketPath: this.api.defaults.socketPath || undefined,
                    method: "POST",
                    headers: {
                        "Upgrade": "tcp",
                        "Connection": "Upgrade",
                    }
                }
            );
            request.on("upgrade", (response, socket) => {
                if (
                    response.headers["content-type"] != "application/vnd.docker.raw-stream" &&
                    response.headers["content-type"] != "application/vnd.docker.multiplexed-stream"
                )
                    reject("wrong upgrade :(");

                return resolve(new ContainerLogs(socket));
            });
            request.on("error", reject);
            request.end();
        });
    }
}

/* eslint-disable @typescript-eslint/naming-convention */
class ContainerLogs extends Duplex {
    private buffer: Buffer;

    constructor(private socket: Socket) {
        super();
        this.buffer = Buffer.alloc(0);

        socket.on('data', this._data.bind(this));
        socket.on("end", () => this.push(null));
        socket.on("error", (err) => this.destroy(err));
    }

    private _data(chunk: Buffer) {
        this.buffer = Buffer.concat([this.buffer, chunk], this.buffer.length + chunk.length);

        while (this.buffer.length >= 8) {
            const type = this.buffer.at(0);
            const length = this.buffer.readUInt32BE(4);
            if (this.buffer.length < 8 + length) break;

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
            if (!this.buffer.length) this.buffer = Buffer.alloc(0);
        };
    }

    override _read(size: number): void {

    }

    public override _write(chunk: Buffer, encoding: BufferEncoding, callback: (err?: Error | null) => void) {
        if (!this.socket.writable) return callback(new Error("Socket closed"));
        return this.socket.write(chunk, encoding, callback);
    }

    public override _final(callback: () => void) {
        if (this.socket.writable) this.socket.end();
        return callback();
    }

    public override _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
        console.error(error);
        console.log("killed");
        try {
            if (!this.socket.closed)
                this.socket.end(callback);
        } catch (err: any) {
            callback(err);
        }
    }
}
/* eslint-enable @typescript-eslint/naming-convention */
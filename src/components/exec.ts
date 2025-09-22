import axios, { type AxiosInstance } from "axios";
import type { InspectExec, CreateExecOptions as CreateExecOptions, CreateExecResponse, ResizeExecOptions, StartExecOptions } from "../typing/exec";
import { APIError, BadParameter, ContainerIsPaused, ContainerNotFound, ExecInstanceNotFound } from "../lib/error";
import { Duplex } from "node:stream";
import http from "node:http";
import { Socket } from "node:net";
import type { If } from "../typing/global";
import { DockerStream } from "../lib/stream";

export class Exec {
    constructor(private api: AxiosInstance) { }

    /**
     * Run new commands inside running containers. Refer to the command-line reference for more information.
     * 
     * To exec a command in a container, you first need to create an exec instance, then start it. These two API endpoints are wrapped up in a single command-line command, `docker exec`.
     * 
     * @param id ID or name of container
     * @see https://docs.docker.com/engine/reference/commandline/exec/
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ContainerExec
     */
    public async create(id: string, options?: CreateExecOptions): Promise<CreateExecResponse> {
        try {
            const response = await this.api.post<CreateExecResponse>(`/containers/${id}/exec`, options);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new ContainerIsPaused(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Starts a previously set up exec instance. If detach is true, this endpoint returns immediately after starting the command. Otherwise, it sets up an interactive session with the command.
     * @param id Exec instance ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecStart
     */
    public async start<IsDetach extends boolean = false>(id: string, options?: StartExecOptions<IsDetach>): Promise<If<IsDetach, string, DockerStream>> {
        return new Promise<If<IsDetach, string, DockerStream>>((resolve, reject) => {
            const request = http.request(
                `${this.api.defaults.baseURL || ""}/v1.51/exec/${id}/start?`,
                {
                    socketPath: this.api.defaults.socketPath || undefined,
                    method: "POST",
                    headers: {
                        "Upgrade": "tcp",
                        "Connection": "Upgrade",
                    },
                },
                (res) => {
                    if (options && !options.Detach) return;
                    let body = "";
                    res.on("data", (chunk) => {
                        body += chunk;
                    });
                    res.on('error', reject);
                    res.on('end', () => resolve(body as any));
                }
            );

            if (!options || !options.Detach)
                request.on("upgrade", (response, socket) => {
                    if (
                        response.headers["content-type"] != "application/vnd.docker.raw-stream" &&
                        response.headers["content-type"] != "application/vnd.docker.multiplexed-stream"
                    )
                        reject("wrong upgrade :(");

                    return resolve(new DockerStream(socket) as any);
                });

            request.on("error", reject);
            if (options)
                request.write(JSON.stringify(options));
            request.end();
        });
    }

    /**
     * Resize the TTY session used by an exec instance. This endpoint only works if `tty` was specified as part of creating and starting the exec instance.
     * @param id Exec instance ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecResize
     */
    public async resize(id: string, options: ResizeExecOptions) {
        try {
            await this.api.post(`/exec/${id}/resize?w=${options.w}&h=${options.h}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ExecInstanceNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Return low-level information about an exec instance.
     * @param id Exec instance ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecInspect
     */
    public async inspect(id: string): Promise<InspectExec> {
        try {
            const response = await this.api.get<InspectExec>(`/exec/${id}/json`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ExecInstanceNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
}
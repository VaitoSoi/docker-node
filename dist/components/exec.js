import axios from "axios";
import { APIError, BadParameter, ContainerIsPaused, ContainerNotFound, ExecInstanceNotFound } from "../lib/error";
import http from "node:http";
import { DockerStream } from "../lib/stream";
export class Exec {
    api;
    constructor(api) {
        this.api = api;
    }
    /**
     * Run new commands inside running containers. Refer to the command-line reference for more information.
     *
     * To exec a command in a container, you first need to create an exec instance, then start it. These two API endpoints are wrapped up in a single command-line command, `docker exec`.
     *
     * @param id ID or name of container
     * @see https://docs.docker.com/engine/reference/commandline/exec/
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ContainerExec
     */
    async create(id, options) {
        try {
            const response = await this.api.post(`/containers/${id}/exec`, options);
            return response.data;
        }
        catch (error) {
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
    async start(id, options) {
        return new Promise((resolve, reject) => {
            const request = http.request(`${this.api.defaults.baseURL || ""}/v1.51/exec/${id}/start?`, {
                socketPath: this.api.defaults.socketPath || undefined,
                method: "POST",
                headers: {
                    "Upgrade": "tcp",
                    "Connection": "Upgrade",
                },
            }, (res) => {
                if (options && !options.Detach)
                    return;
                let body = "";
                res.on("data", (chunk) => {
                    body += chunk;
                });
                res.on('error', reject);
                res.on('end', () => resolve(body));
            });
            if (!options || !options.Detach)
                request.on("upgrade", (response, socket) => {
                    if (response.headers["content-type"] != "application/vnd.docker.raw-stream" &&
                        response.headers["content-type"] != "application/vnd.docker.multiplexed-stream")
                        reject("wrong upgrade :(");
                    return resolve(new DockerStream(socket));
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
    async resize(id, options) {
        try {
            await this.api.post(`/exec/${id}/resize?w=${options.w}&h=${options.h}`);
        }
        catch (error) {
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
    async inspect(id) {
        try {
            const response = await this.api.get(`/exec/${id}/json`);
            return response.data;
        }
        catch (error) {
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
//# sourceMappingURL=exec.js.map
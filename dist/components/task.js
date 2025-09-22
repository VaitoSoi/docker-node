import axios from "axios";
import { APIError, NotInSwarm, TaskNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";
import { ReadOnlyDockerStream } from "../lib/stream";
import http from "node:http";
export class Task {
    api;
    constructor(api) {
        this.api = api;
    }
    async list(filter) {
        try {
            const response = await this.api.get(`/tasks?` + objectToQuery({ filter }, {}, ['filter']));
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    async inspect(id) {
        try {
            const response = await this.api.get(`/tasks/${id}`);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new TaskNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * Get `stdout` and `stderr` logs from a task.
     *
     * Note: This endpoint works only for services with the `local`, `json-file` or `journald` logging drivers.
     *
     * @param id ID of the task
     */
    async logs(id, option) {
        return new Promise((resolve, reject) => {
            const request = http.request(`${this.api.defaults.baseURL || ""}/v1.51/tasks/${id}/logs?` + objectToQuery(option || {}), {
                socketPath: this.api.defaults.socketPath || undefined,
                method: "GET",
                headers: {
                    "Upgrade": "tcp",
                    "Connection": "Upgrade",
                }
            });
            request.on("upgrade", (response, socket) => {
                if (response.headers["content-type"] != "application/vnd.docker.raw-stream" &&
                    response.headers["content-type"] != "application/vnd.docker.multiplexed-stream")
                    reject("wrong upgrade :(");
                return resolve(new ReadOnlyDockerStream(socket));
            });
            request.on("error", reject);
            request.end();
        });
    }
}
//# sourceMappingURL=task.js.map
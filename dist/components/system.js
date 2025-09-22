import axios from "axios";
import { APIError, AuthError, BadParameter } from "../lib/error";
import { objectToQuery } from "../lib/utils";
export class System {
    api;
    constructor(api) {
        this.api = api;
    }
    async auth(option) {
        try {
            const response = await this.api.post("/auth", option);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 401)
                    throw new AuthError(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    async info() {
        try {
            const response = await this.api.get("/info");
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    async version() {
        try {
            const response = await this.api.get("/version");
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    async *event(option = {}) {
        try {
            const response = await this.api.get("/events?" + objectToQuery(option, {}, ['filter']), {
                responseType: "stream"
            });
            let buffer = "";
            const stream = response.data;
            for await (const chunk of stream) {
                buffer += chunk.toString('utf8');
                let idx;
                while ((idx = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 1);
                    if (!line)
                        continue;
                    yield JSON.parse(line);
                }
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    async usage() {
        try {
            const response = await this.api.get("/system/df?");
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
}
//# sourceMappingURL=system.js.map
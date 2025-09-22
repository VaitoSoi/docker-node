import type { AxiosInstance } from "axios";
import type { AuthOption, AuthResponse, UsageObjectType, SystemInfo, SystemVersion, UsageResponse, MonitorOption } from "../typing/system";
import axios from "axios";
import { APIError, AuthError, BadParameter } from "../lib/error";
import { objectToQuery } from "../lib/utils";

export class System {
    constructor(private api: AxiosInstance) { }

    public async auth(option: AuthOption): Promise<AuthResponse | undefined> {
        try {
            const response = await this.api.post<AuthResponse | undefined>("/auth", option);
            return response.data;
        } catch (error) {
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

    public async info(): Promise<SystemInfo> {
        try {
            const response = await this.api.get<SystemInfo>("/info");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    public async version(): Promise<SystemVersion> {
        try {
            const response = await this.api.get<SystemVersion>("/version");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    public async *event(option: MonitorOption = {}) {
        try {
            const response = await this.api.get(
                "/events?" + objectToQuery(option, {}, ['filter']),
                {
                    responseType: "stream"
                }
            );
            let buffer = "";
            const stream = response.data;
            for await (const chunk of stream) {
                buffer += chunk.toString('utf8');

                let idx;
                while ((idx = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 1);
                    if (!line) continue;
                    yield JSON.parse(line);
                }
            }

        } catch (error) {
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

    public async usage(type: [UsageObjectType, ...rest: UsageObjectType[]]): Promise<UsageResponse> {
        try {
            const response = await this.api.get<UsageResponse>("/system/df?" + objectToQuery({ type }, {}, ['type']));
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
}

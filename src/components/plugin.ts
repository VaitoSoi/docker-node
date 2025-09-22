import type { AxiosInstance } from "axios";
import type { InstallPluginOption, InstallPluginParam, ListPluginFilter, PluginObject, PluginPrivilege } from "../../typing/plugin";
import { objectToQuery } from "../lib/utils";
import axios from "axios";
import { APIError, PluginNotFound } from "../lib/error";
import fs from "node:fs";
import type { AuthConfig } from "../../typing/client";

export class Plugin {
    private readonly AuthConfigString?: string;

    constructor(private api: AxiosInstance, authConfig?: AuthConfig) {
        if (authConfig)
            this.AuthConfigString = JSON.stringify(authConfig);
    }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginList
     */
    public async list(filters: ListPluginFilter): Promise<PluginObject[]> {
        try {
            const response = await this.api.get<PluginObject[]>(`/plugins?` + objectToQuery({ filters }, {}, ['filters']));
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

    /**
     * @param remote The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/GetPluginPrivileges
     */
    public async privileges(remote: string): Promise<PluginPrivilege> {
        try {
            const response = await this.api.get<PluginPrivilege>(`/plugins/privileges?` + objectToQuery({ remote }));
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

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginPull
     */
    public async install(option: InstallPluginOption) {
        const headers: Record<string, string> = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });

        const param: InstallPluginParam = {
            remote: option.remote,
            name: option.name
        };
        const body: PluginPrivilege[] = option.body;
        try {
            await this.api.post(`/plugins/pull?` + objectToQuery(param), body);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginInspect
     */
    public async inspect(name: string): Promise<PluginObject> {
        try {
            const response = await this.api.get<PluginObject>(`/plugins/${name}/json`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }


    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param force Disable the plugin before removing. This may result in issues if the plugin is in use by a container.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginDelete
     */
    public async remove(name: string, force: boolean = false): Promise<PluginObject> {
        try {
            const response = await this.api.delete<PluginObject>(`/plugins/${name}?` + objectToQuery({ force }));
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param timeout Set the HTTP client timeout (in seconds)
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginEnable
     */
    public async enable(name: string, timeout: number = 0) {
        try {
            await this.api.post(`/plugins/${name}/enable?` + objectToQuery({ timeout }));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param force Force disable a plugin even if still in use.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginDisable
     */
    public async disable(name: string, force: boolean = false) {
        try {
            await this.api.post(`/plugins/${name}/disable?` + objectToQuery({ force }));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginUpgrade
     */
    public async upgrade(option: Required<InstallPluginOption>) {
        const headers: Record<string, string> = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });

        const param: Omit<InstallPluginParam, "name"> = {
            remote: option.remote,
        };
        const body: PluginPrivilege[] = option.body;
        try {
            await this.api.post(`/plugins/${option.name}/upgrde?` + objectToQuery(param), body);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(option.name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param path The path to tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginCreate
     */
    public async create(name: string, path: string) {
        const readFileStream = fs.createReadStream(path);
        try {
            await this.api.post(`/plugins/create?` + objectToQuery({ name }), readFileStream);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginPush
     */
    public async push(name: string) {
        try {
            await this.api.post(`/plugins/${name}/push`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginSet
     */
    public async configure(name: string, body: string[]) {
        try {
            await this.api.post(`/plugins/${name}/set`, body);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new PluginNotFound(name);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
}
import { objectToQuery } from "../lib/utils";
import axios from "axios";
import { APIError, PluginNotFound } from "../lib/error";
import fs from "node:fs";
export class Plugin {
    api;
    AuthConfigString;
    constructor(api, authConfig) {
        this.api = api;
        if (authConfig)
            this.AuthConfigString = JSON.stringify(authConfig);
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginList
     */
    async list(filters) {
        try {
            const response = await this.api.get(`/plugins?` + objectToQuery({ filters }, {}, ['filters']));
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
    /**
     * @param remote The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/GetPluginPrivileges
     */
    async privileges(remote) {
        try {
            const response = await this.api.get(`/plugins/privileges?` + objectToQuery({ remote }));
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
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginPull
     */
    async install(option) {
        const headers = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });
        const param = {
            remote: option.remote,
            name: option.name
        };
        const body = option.body;
        try {
            await this.api.post(`/plugins/pull?` + objectToQuery(param), body);
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
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginInspect
     */
    async inspect(name) {
        try {
            const response = await this.api.get(`/plugins/${name}/json`);
            return response.data;
        }
        catch (error) {
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
    async remove(name, force = false) {
        try {
            const response = await this.api.delete(`/plugins/${name}?` + objectToQuery({ force }));
            return response.data;
        }
        catch (error) {
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
    async enable(name, timeout = 0) {
        try {
            await this.api.post(`/plugins/${name}/enable?` + objectToQuery({ timeout }));
        }
        catch (error) {
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
    async disable(name, force = false) {
        try {
            await this.api.post(`/plugins/${name}/disable?` + objectToQuery({ force }));
        }
        catch (error) {
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
    async upgrade(option) {
        const headers = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });
        const param = {
            remote: option.remote,
        };
        const body = option.body;
        try {
            await this.api.post(`/plugins/${option.name}/upgrde?` + objectToQuery(param), body);
        }
        catch (error) {
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
    async create(name, path) {
        const readFileStream = fs.createReadStream(path);
        try {
            await this.api.post(`/plugins/create?` + objectToQuery({ name }), readFileStream);
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
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginPush
     */
    async push(name) {
        try {
            await this.api.post(`/plugins/${name}/push`);
        }
        catch (error) {
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
    async configure(name, body) {
        try {
            await this.api.post(`/plugins/${name}/set`, body);
        }
        catch (error) {
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
//# sourceMappingURL=plugin.js.map
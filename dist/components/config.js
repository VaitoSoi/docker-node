import axios from "axios";
import { APIError, BadParameter, ConfigNotFound, NameIsUsed, NotInSwarm } from "../lib/error";
import { objectToQuery } from "../lib/utils";
export class Config {
    api;
    constructor(api) {
        this.api = api;
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigList
     */
    async list(filters) {
        try {
            const response = await this.api.get(`/config?` + objectToQuery({ filters }, {}, ['filters']));
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
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigCreate
     */
    async create(option) {
        try {
            const response = await this.api.post(`/config`, option);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 409)
                    throw new NameIsUsed(option.Name || "");
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigInspect
     */
    async inspect(id) {
        try {
            const response = await this.api.get(`/config/${id}`);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ConfigNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigDelete
     */
    async delete(id) {
        try {
            await this.api.delete(`/config/${id}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ConfigNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * Currently, only the Labels field can be updated. All other fields must remain unchanged from the ConfigInspect endpoint response values.
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigUpdate
     */
    async update(id, option) {
        const param = {
            version: option.version
        };
        const body = {
            Labels: option.Labels
        };
        try {
            await this.api.post(`/config/${id}/update?` + objectToQuery(param), body);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ConfigNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
}
//# sourceMappingURL=config.js.map
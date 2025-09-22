import type { AxiosInstance } from "axios";
import type { CreateConfigResponse, ListConfigFilter, ConfigObject, ConfigSpec, UpdateConfigBody, UpdateConfigOption, UpdateConfigParam } from "../typing/config";
import axios from "axios";
import { APIError, BadParameter, ConfigNotFound, NameIsUsed, NotInSwarm, SecretNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";

export class Config {
    constructor (private api: AxiosInstance) { }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigList
     */
    public async list(filters?: ListConfigFilter): Promise<ConfigObject[]> {
        try {
            const response = await this.api.get<ConfigObject[]>(`/config?` + objectToQuery({ filters }, {}, ['filters']));
            return response.data;
        } catch (error) {
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
    public async create(option: Partial<ConfigSpec>): Promise<CreateConfigResponse> {
        try {
            const response = await this.api.post<CreateConfigResponse>(`/config`, option);
            return response.data;
        } catch (error) {
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
    public async inspect(id: string): Promise<ConfigObject> {
        try {
            const response = await this.api.get<ConfigObject>(`/config/${id}`);
            return response.data;
        } catch (error) {
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
    public async delete (id: string) {
        try {
            await this.api.delete(`/config/${id}`);
        } catch (error) {
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
    public async update(id: string, option: UpdateConfigOption) {
        const param: UpdateConfigParam = {
            version: option.version
        };
        const body: UpdateConfigBody = {
            Labels: option.Labels
        };

        try {
            await this.api.post(`/config/${id}/update?` + objectToQuery(param), body);
        }  catch (error) {
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
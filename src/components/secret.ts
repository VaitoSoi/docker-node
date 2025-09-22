import type { AxiosInstance } from "axios";
import type { CreateSecretResponse, ListSecretFilter, SecretObject, SecretSpec, UpdateSecretBody, UpdateSecretOption, UpdateSecretParam } from "../typing/secret";
import axios from "axios";
import { APIError, BadParameter, NameIsUsed, NotInSwarm, SecretNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";

export class Secret {
    constructor (private api: AxiosInstance) { }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretList
     */
    public async list(filters?: ListSecretFilter): Promise<SecretObject[]> {
        try {
            const response = await this.api.get<SecretObject[]>(`/secrets?` + objectToQuery({ filters }, {}, ['filters']));
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretCreate
     */
    public async create(option: Partial<SecretSpec>): Promise<CreateSecretResponse> {
        try {
            const response = await this.api.post<CreateSecretResponse>(`/secrets`, option);
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretInspect
     */
    public async inspect(id: string): Promise<SecretObject> {
        try {
            const response = await this.api.get<SecretObject>(`/secrets/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new SecretNotFound(id);
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretDelete
     */
    public async delete (id: string) {
        try {
            await this.api.delete(`/secrets/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new SecretNotFound(id);
                else if (error.status == 500) 
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }

    /**
     * Currently, only the Labels field can be updated. All other fields must remain unchanged from the SecretInspect endpoint response values.
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretUpdate
     */
    public async update(id: string, option: UpdateSecretOption) {
        const param: UpdateSecretParam = {
            version: option.version
        };
        const body: UpdateSecretBody = {
            Labels: option.Labels
        };

        try {
            await this.api.post(`/secrets/${id}/update?` + objectToQuery(param), body);
        }  catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new SecretNotFound(id);
                else if (error.status == 500) 
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
}
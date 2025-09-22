import type { AxiosInstance } from "axios";
import type { CreateServiceOption, CreateServiceResponse, ListServiceFilter, ServiceObject, UpdateServiceOption, UpdateServiceParam } from "../typing/service";
import axios from "axios";
import { APIError, BadParameter, CanNotUseNetwork, NameIsUsed, NotInSwarm, ServiceNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";
import { ReadOnlyDockerStream } from "../lib/stream";
import http from 'node:http';
import type { SwarmShareLogOption } from "../typing/global";
import type { AuthConfig } from "../typing/client";

export class Service {
    private readonly AuthConfigString?: string;

    constructor(private api: AxiosInstance, authConfig?: AuthConfig) {
        if (authConfig)
            this.AuthConfigString = JSON.stringify(authConfig);
    }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceList
     */
    public async list(filters: ListServiceFilter): Promise<ServiceObject[]> {
        try {
            const response = await this.api.get<ServiceObject[]>(`/services?` + objectToQuery({ filters }, {}, ['filters']));
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceCreate
     */
    public async create(option: CreateServiceOption): Promise<CreateServiceResponse> {
        const headers: Record<string, string> = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });

        try {
            const response = await this.api.put<CreateServiceResponse>(`/services?`, option);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 403)
                    throw new CanNotUseNetwork(message);
                else if (error.status == 409)
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
     * @param id ID or name of service.
     * @param insertDefaults Fill empty fields with default values.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceInspect
     */
    public async inspect(id: string, insertDefaults: boolean = true): Promise<ServiceObject> {
        try {
            const response = await this.api.get<ServiceObject>(`/services/${id}?` + objectToQuery({ insertDefaults }));
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ServiceNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }

    /**
     * @param id ID or name of service.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceDelete
     */
    public async remove(id: string) {
        try {
            await this.api.delete(`/services/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ServiceNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }

    /**
     * @param id ID or name of service.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceUpdate
     */
    public async update(id: string, option: UpdateServiceOption) {
        const headers: Record<string, string> = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });

        const queryParam: UpdateServiceParam = {
            registryAuthFrom: option.registryAuthFrom,
            rollback: option.rollback,
            version: option.version
        };
        const body: CreateServiceOption = {
            EndpointSpec: option.EndpointSpec,
            Labels: option.Labels,
            Mode: option.Mode,
            Name: option.Name,
            RollbackConfig: option.RollbackConfig,
            TaskTemplate: option.TaskTemplate,
            UpdateConfig: option.UpdateConfig,
        };

        try {
            const response = await this.api.post(`/services/${id}/update?` + objectToQuery({ queryParam }), body);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ServiceNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }

    /**
     * Get stdout and stderr logs from a service.
     * 
     * Note: This endpoint works only for services with the `local`, `json-file` or `journald` logging drivers.
     * 
     * @param id ID or name of the service
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceLogs
     */
    public async logs(id: string, option: SwarmShareLogOption): Promise<ReadOnlyDockerStream> {
        return new Promise<ReadOnlyDockerStream>((resolve, reject) => {
            const request = http.request(
                `${this.api.defaults.baseURL || ""}/v1.51/services/${id}/logs?` + objectToQuery(option || {}),
                {
                    socketPath: this.api.defaults.socketPath || undefined,
                    method: "GET",
                    headers: {
                        "Upgrade": "tcp",
                        "Connection": "Upgrade",
                    }
                }
            );
            request.on("upgrade", (response, socket) => {
                if (
                    response.headers["content-type"] != "application/vnd.docker.raw-stream" &&
                    response.headers["content-type"] != "application/vnd.docker.multiplexed-stream"
                )
                    reject("wrong upgrade :(");

                return resolve(new ReadOnlyDockerStream(socket));
            });
            request.on("error", reject);
            request.end();
        });
    }
}

import type { AxiosInstance } from "axios";
import type { CreateServiceOption, CreateServiceResponse, ListServiceFilter, ServiceObject, UpdateServiceOption } from "../../typing/service";
import { ReadOnlyDockerStream } from "../lib/stream";
import type { SwarmShareLogOption } from "../../typing/global";
import type { AuthConfig } from "../../typing/client";
export declare class Service {
    private api;
    private readonly AuthConfigString?;
    constructor(api: AxiosInstance, authConfig?: AuthConfig);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceList
     */
    list(filters: ListServiceFilter): Promise<ServiceObject[]>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceCreate
     */
    create(option: CreateServiceOption): Promise<CreateServiceResponse>;
    /**
     * @param id ID or name of service.
     * @param insertDefaults Fill empty fields with default values.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceInspect
     */
    inspect(id: string, insertDefaults?: boolean): Promise<ServiceObject>;
    /**
     * @param id ID or name of service.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceDelete
     */
    remove(id: string): Promise<void>;
    /**
     * @param id ID or name of service.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceUpdate
     */
    update(id: string, option: UpdateServiceOption): Promise<any>;
    /**
     * Get stdout and stderr logs from a service.
     *
     * Note: This endpoint works only for services with the `local`, `json-file` or `journald` logging drivers.
     *
     * @param id ID or name of the service
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Service/operation/ServiceLogs
     */
    logs(id: string, option: SwarmShareLogOption): Promise<ReadOnlyDockerStream>;
}

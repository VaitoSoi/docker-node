import type { AxiosInstance } from "axios";
import type { CreateConfigResponse, ListConfigFilter, ConfigObject, ConfigSpec, UpdateConfigOption } from "../../typing/config";
export declare class Config {
    private api;
    constructor(api: AxiosInstance);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigList
     */
    list(filters?: ListConfigFilter): Promise<ConfigObject[]>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigCreate
     */
    create(option: Partial<ConfigSpec>): Promise<CreateConfigResponse>;
    /**
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigInspect
     */
    inspect(id: string): Promise<ConfigObject>;
    /**
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigDelete
     */
    delete(id: string): Promise<void>;
    /**
     * Currently, only the Labels field can be updated. All other fields must remain unchanged from the ConfigInspect endpoint response values.
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Config/operation/ConfigUpdate
     */
    update(id: string, option: UpdateConfigOption): Promise<void>;
}

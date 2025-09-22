import type { AxiosInstance } from "axios";
import type { CreateSecretResponse, ListSecretFilter, SecretObject, SecretSpec, UpdateSecretOption } from "../../typing/secret";
export declare class Secret {
    private api;
    constructor(api: AxiosInstance);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretList
     */
    list(filters?: ListSecretFilter): Promise<SecretObject[]>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretCreate
     */
    create(option: Partial<SecretSpec>): Promise<CreateSecretResponse>;
    /**
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretInspect
     */
    inspect(id: string): Promise<SecretObject>;
    /**
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretDelete
     */
    delete(id: string): Promise<void>;
    /**
     * Currently, only the Labels field can be updated. All other fields must remain unchanged from the SecretInspect endpoint response values.
     * @param id The ID or name of the secret
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Secret/operation/SecretUpdate
     */
    update(id: string, option: UpdateSecretOption): Promise<void>;
}

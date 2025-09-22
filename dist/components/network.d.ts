import { type AxiosInstance } from "axios";
import type { CreateNetworkOption, CreateNetworkResponse, LinkContainerOption, ListFilter, NetworkObject, PruneFilter, PruneResponse } from "../../typing/network";
export declare class Network {
    private api;
    constructor(api: AxiosInstance);
    /**
     * Returns a list of networks
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkList
     */
    list(filters?: ListFilter): Promise<NetworkObject<false>>;
    /**
     * Inspect a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkInspect
     */
    inspect(id: string, options?: {
        /** Detailed inspect output for troubleshooting */
        verbose?: boolean;
        /** Filter the network by scope */
        scope?: string;
    }): Promise<NetworkObject<true>>;
    /**
     * Remove a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkDelete
     */
    remove(id: string): Promise<void>;
    /**
     * Create a network
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkCreate
     */
    create(options: CreateNetworkOption): Promise<CreateNetworkResponse>;
    /**
     * The network must be either a local-scoped network or a swarm-scoped network with the attachable option set. A network cannot be re-attached to a running container
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkConnect
     */
    connect(id: string, options: LinkContainerOption): Promise<void>;
    /**
     * Disconnect a container from a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkDisconnect
     */
    disconnect(id: string, options?: {
        /** The ID or name of the container to disconnect from the network. */
        Container?: string;
        /** Force the container to disconnect from the network. */
        Force?: boolean;
    }): Promise<void>;
    /**
     * Delete unused networks
     * @param filters Filters to process on the prune list
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkPrune
     */
    prune(filters?: PruneFilter): Promise<PruneResponse>;
}

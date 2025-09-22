import axios, { type AxiosInstance } from "axios";
import type { CreateNetworkOption, CreateNetworkResponse, LinkContainerOption, ListFilter, NetworkObject, PruneFilter, PruneResponse } from "../typing/network";
import { APIError, BadParameter, Forbidden, NetworkNotFound, NetworkOrContainerNotFound, PluginNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";

export class Network {
    constructor(private api: AxiosInstance) { }

    /**
     * Returns a list of networks
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkList
     */
    public async list(filters?: ListFilter): Promise<NetworkObject<false>> {
        try {
            const response = await this.api.get<NetworkObject<false>>(
                `/networks?` + objectToQuery({ filters }, {}, ['filters'])
            );
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
     * Inspect a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkInspect
     */
    public async inspect(id: string, options?: {
        /** Detailed inspect output for troubleshooting */
        verbose?: boolean,
        /** Filter the network by scope */
        scope?: string
    }): Promise<NetworkObject<true>> {
        try {
            const response = await this.api.get<NetworkObject<true>>(
                `/networks/${id}?` + objectToQuery(options || {})
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new NetworkNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Remove a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkDelete
     */
    public async remove(id: string) {
        try {
            await this.api.delete(`/networks/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 403)
                    throw new Forbidden(message);
                else if (error.status == 404)
                    throw new NetworkNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Create a network
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkCreate
     */
    public async create(options: CreateNetworkOption): Promise<CreateNetworkResponse> {
        try {
            const response = await this.api.post<CreateNetworkResponse>(
                `/networks/create`,
                options
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 403)
                    throw new Forbidden(message);
                else if (error.status == 404)
                    throw new PluginNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * The network must be either a local-scoped network or a swarm-scoped network with the attachable option set. A network cannot be re-attached to a running container
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkConnect
     */
    public async connect(id: string, options: LinkContainerOption) {
        try {
            await this.api.post(`/networks/${id}/connect`, options);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 403)
                    throw new Forbidden(message);
                else if (error.status == 404)
                    throw new NetworkOrContainerNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Disconnect a container from a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkDisconnect
     */
    public async disconnect(id: string, options?: {
        /** The ID or name of the container to disconnect from the network. */
        Container?: string,
        /** Force the container to disconnect from the network. */
        Force?: boolean,
    }) {
        try {
            await this.api.post(
                `/networks/${id}/disconnect`,
                options || {}
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 403)
                    throw new Forbidden(message);
                else if (error.status == 404)
                    throw new NetworkOrContainerNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * Delete unused networks
     * @param filters Filters to process on the prune list
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkPrune
     */
    public async prune(filters?: PruneFilter): Promise<PruneResponse> {
        try {
            const response = await this.api.post(`/networks/prune?` + objectToQuery({ filters }, {}, ['filters']));
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
}
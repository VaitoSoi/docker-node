import axios from "axios";
import { APIError, BadParameter, Forbidden, NetworkNotFound, NetworkOrContainerNotFound, PluginNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";
export class Network {
    api;
    constructor(api) {
        this.api = api;
    }
    /**
     * Returns a list of networks
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkList
     */
    async list(filters) {
        try {
            const response = await this.api.get(`/networks?` + objectToQuery({ filters }, {}, ['filters']));
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
     * Inspect a network
     * @param id Network ID or name
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Network/operation/NetworkInspect
     */
    async inspect(id, options) {
        try {
            const response = await this.api.get(`/networks/${id}?` + objectToQuery(options || {}));
            return response.data;
        }
        catch (error) {
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
    async remove(id) {
        try {
            await this.api.delete(`/networks/${id}`);
        }
        catch (error) {
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
    async create(options) {
        try {
            const response = await this.api.post(`/networks/create`, options);
            return response.data;
        }
        catch (error) {
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
    async connect(id, options) {
        try {
            await this.api.post(`/networks/${id}/connect`, options);
        }
        catch (error) {
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
    async disconnect(id, options) {
        try {
            await this.api.post(`/networks/${id}/disconnect`, options || {});
        }
        catch (error) {
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
    async prune(filters) {
        try {
            const response = await this.api.post(`/networks/prune?` + objectToQuery({ filters }, {}, ['filters']));
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
}
//# sourceMappingURL=network.js.map
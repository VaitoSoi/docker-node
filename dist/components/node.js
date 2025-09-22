import { objectToQuery } from "../lib/utils";
import axios from "axios";
import { APIError, BadParameter, NodeNotFound, NotInSwarm } from "../lib/error";
export class Node {
    api;
    constructor(api) {
        this.api = api;
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeList
     */
    async list(filter) {
        try {
            const response = await this.api.get(`/nodes?` + objectToQuery({ filter }, {}, ['filter']));
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
     * @param id The ID or name of the node
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeInspect
     */
    async inspect(id) {
        try {
            const response = await this.api.get(`/nodes/${id}`);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new NodeNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * @param id The ID or name of the node
     * @param force Force remove a node from the swarm
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeDelete
     */
    async remove(id, force = false) {
        try {
            await this.api.delete(`/nodes/${id}?` + objectToQuery({ force }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new NodeNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * @param id The ID of the node
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeUpdate
     */
    async update(id, option) {
        const queryParam = { version: option.version };
        const body = {
            Availability: option.Availability,
            Labels: option.Labels,
            Name: option.Name,
            Role: option.Role
        };
        try {
            await this.api.post(`/nodes/${id}/update?` + objectToQuery(queryParam), body);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new NodeNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
}
//# sourceMappingURL=node.js.map
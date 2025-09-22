import axios from "axios";
import { AlreadyInSwarm, APIError, BadParameter, NotInSwarm, SwarmNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";
export class Swarm {
    api;
    constructor(api) {
        this.api = api;
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmInspect
     */
    async inspect() {
        try {
            const response = await this.api.get(`/swarm`);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new SwarmNotFound();
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmInit
     */
    async init(option) {
        try {
            const response = await this.api.post(`/swarm/init`, option);
            return { Id: response.data };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new AlreadyInSwarm();
            }
            throw error;
        }
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmJoin
     */
    async join(option) {
        try {
            await this.api.post(`/swarm/join`, option);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new AlreadyInSwarm();
            }
            throw error;
        }
    }
    /**
     * @param force Force leave swarm, even if this is the last manager or that it will break the cluster.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmLeave
     */
    async leave(force = false) {
        try {
            await this.api.post(`/swarm/leave?` + objectToQuery({ force }));
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUpdate
     */
    async update(options) {
        const queryParam = {
            version: options.version,
            rotateManagerToken: options.rotateManagerToken,
            rotateManagerUnlockKey: options.rotateManagerUnlockKey,
            rotateWorkerToken: options.rotateWorkerToken
        };
        const body = {
            CAConfig: options.CAConfig,
            Dispatcher: options.Dispatcher,
            EncryptionConfig: options.EncryptionConfig,
            Labels: options.Labels,
            Name: options.Name,
            Orchestration: options.Orchestration,
            Raft: options.Raft,
            TaskDefaults: options.TaskDefaults
        };
        try {
            await this.api.post(`/swarm/join?` + objectToQuery(queryParam), body);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUnlockkey
     */
    async getUnlockKey() {
        try {
            const response = await this.api.get(`/swarm/unlockkey`);
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUnlock
     */
    async unlockManager(unlockKey) {
        try {
            await this.api.post(`/swarm/unlock`, { UnlockKey: unlockKey });
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
}
//# sourceMappingURL=swarm.js.map
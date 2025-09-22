import axios, { AxiosError, type AxiosInstance } from "axios";
import type { InitSwarmOption, InitSwarmResponse, InspectSwarm, JoinSwarm, SwarmUnlockKey, UpdateSwarmBody, UpdateSwarmOption, UpdateSwarmParam } from "../../typing/swarm";
import { AlreadyInSwarm, APIError, BadParameter, NotInSwarm, SwarmNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";

export class Swarm {
    constructor(private api: AxiosInstance) { }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmInspect
     */
    public async inspect(): Promise<InspectSwarm> {
        try {
            const response = await this.api.get<InspectSwarm>(`/swarm`);
            return response.data;
        } catch (error) {
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
    public async init(option: InitSwarmOption): Promise<InitSwarmResponse> {
        try {
            const response = await this.api.post<string>(`/swarm/init`, option);
            return { Id: response.data };
        } catch (error) {
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
    public async join(option: JoinSwarm) {
        try {
            await this.api.post(`/swarm/join`, option);
        } catch (error) {
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
    public async leave(force: boolean = false) {
        try {
            await this.api.post(`/swarm/leave?` + objectToQuery({ force }));
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUpdate
     */
    public async update(options: UpdateSwarmOption) {
        const queryParam: UpdateSwarmParam = {
            version: options.version,
            rotateManagerToken: options.rotateManagerToken,
            rotateManagerUnlockKey: options.rotateManagerUnlockKey,
            rotateWorkerToken: options.rotateWorkerToken
        };
        const body: UpdateSwarmBody = {
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
        } catch (error) {
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
    public async getUnlockKey(): Promise<SwarmUnlockKey> {
        try {
            const response = await this.api.get<SwarmUnlockKey>(`/swarm/unlockkey`);
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUnlock
     */
    public async unlockManager(unlockKey: string) {
        try {
            await this.api.post(`/swarm/unlock`, { UnlockKey: unlockKey });    
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
}
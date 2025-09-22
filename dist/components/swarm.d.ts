import { type AxiosInstance } from "axios";
import type { InitSwarmOption, InitSwarmResponse, InspectSwarm, JoinSwarm, SwarmUnlockKey, UpdateSwarmOption } from "../../typing/swarm";
export declare class Swarm {
    private api;
    constructor(api: AxiosInstance);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmInspect
     */
    inspect(): Promise<InspectSwarm>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmInit
     */
    init(option: InitSwarmOption): Promise<InitSwarmResponse>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmJoin
     */
    join(option: JoinSwarm): Promise<void>;
    /**
     * @param force Force leave swarm, even if this is the last manager or that it will break the cluster.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmLeave
     */
    leave(force?: boolean): Promise<void>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUpdate
     */
    update(options: UpdateSwarmOption): Promise<void>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUnlockkey
     */
    getUnlockKey(): Promise<SwarmUnlockKey>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Swarm/operation/SwarmUnlock
     */
    unlockManager(unlockKey: string): Promise<void>;
}

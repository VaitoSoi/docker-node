import type { AxiosInstance } from "axios";
import type { VolumeObject, ListVolumeFilter, CreateVolumeOption, UpdateVolumeOption, PruneVolumeFilter, PruneVolumeResponse } from "../../typing/volume";
export declare class Volume {
    private api;
    constructor(api: AxiosInstance);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeList
     */
    list(filter: ListVolumeFilter): Promise<VolumeObject[]>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeCreate
     */
    create(option: CreateVolumeOption): Promise<VolumeObject>;
    /**
     * @param id Volume name or ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeInspect
     */
    inspect(id: string): Promise<VolumeObject>;
    /**
     * Valid only for Swarm cluster volumes
     *
     * Currently, only `Availability` may change. All other fields must remain unchanged.
     *
     * @param id The name or ID of the volume
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeUpdate
     */
    update(id: string, option: UpdateVolumeOption): Promise<void>;
    /**
     * @param id Volume name or ID
     * @param force Force the removal of the volume
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeDelete
     */
    remove(id: string, force?: boolean): Promise<void>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumePrune
     */
    prune(filter: PruneVolumeFilter): Promise<PruneVolumeResponse>;
}

import type { AxiosInstance } from "axios";
import type { VolumeObject, ListVolumeFilter, CreateVolumeOption, UpdateVolumeOption, UpdateVolumeParam, UpdateVolumeBody, PruneVolumeFilter, PruneVolumeResponse } from "../../typing/volume";
import axios from "axios";
import { APIError, BadParameter, NotInSwarm, VolumeIsInUse, VolumeNotFound } from "../lib/error";
import { objectToQuery } from "../lib/utils";

export class Volume {
    constructor(private api: AxiosInstance) { }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeList
     */
    public async list(filter: ListVolumeFilter): Promise<VolumeObject[]> {
        try {
            const response = await this.api.get<VolumeObject[]>(`/volumes?` + objectToQuery({ filter }, {}, ['filter']));
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
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeCreate
     */
    public async create(option: CreateVolumeOption): Promise<VolumeObject> {
        try {
            const response = await this.api.post<VolumeObject>(`/volumes/create`, option);
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
     * @param id Volume name or ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeInspect
     */
    public async inspect(id: string): Promise<VolumeObject> {
        try {
            const response = await this.api.get<VolumeObject>(`/volumes/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new VolumeNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    
    /**
     * Valid only for Swarm cluster volumes
     * 
     * Currently, only `Availability` may change. All other fields must remain unchanged.
     * 
     * @param id The name or ID of the volume
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeUpdate
     */
    public async update(id: string, option: UpdateVolumeOption) {
        const quaryParam: UpdateVolumeParam = {
            version: option.version
        };
        const body: UpdateVolumeBody = {
            Spec: option.Spec
        };

        try {
            await this.api.put(`/volumes/${id}?` + objectToQuery(quaryParam), body);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new VolumeNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
                else if (error.status == 503)
                    throw new NotInSwarm();
            }
            throw error;
        }
    }

    /**
     * @param id Volume name or ID
     * @param force Force the removal of the volume
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumeDelete
     */
    public async remove(id: string, force: boolean = false) {
        try {
            await this.api.delete(`/volumes/${id}?` + objectToQuery({ force }));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new VolumeNotFound(id);
                else if (error.status == 409)
                    throw new VolumeIsInUse(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }

    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Volume/operation/VolumePrune
     */
    public async prune(filter: PruneVolumeFilter): Promise<PruneVolumeResponse> {
        try {
            const response = await this.api.delete<PruneVolumeResponse>(`/volumes/prune?` + objectToQuery({ filter }, {}, ['filter']));
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
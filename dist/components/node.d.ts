import type { AxiosInstance } from "axios";
import type { ListNodeFilter, NodeObject, UpdateNodeOption } from "../../typing/node";
export declare class Node {
    private api;
    constructor(api: AxiosInstance);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeList
     */
    list(filter?: ListNodeFilter): Promise<NodeObject[]>;
    /**
     * @param id The ID or name of the node
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeInspect
     */
    inspect(id: string): Promise<NodeObject>;
    /**
     * @param id The ID or name of the node
     * @param force Force remove a node from the swarm
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeDelete
     */
    remove(id: string, force?: boolean): Promise<void>;
    /**
     * @param id The ID of the node
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Node/operation/NodeUpdate
     */
    update(id: string, option: UpdateNodeOption): Promise<void>;
}

import type { AxiosInstance } from "axios";
import type { ListTaskFilter, TaskObject } from "../../typing/task";
import type { SwarmShareLogOption } from "../../typing/global";
import { ReadOnlyDockerStream } from "../lib/stream";
export declare class Task {
    private api;
    constructor(api: AxiosInstance);
    list(filter?: ListTaskFilter): Promise<TaskObject[]>;
    inspect(id: string): Promise<TaskObject>;
    /**
     * Get `stdout` and `stderr` logs from a task.
     *
     * Note: This endpoint works only for services with the `local`, `json-file` or `journald` logging drivers.
     *
     * @param id ID of the task
     */
    logs(id: string, option: SwarmShareLogOption): Promise<ReadOnlyDockerStream>;
}

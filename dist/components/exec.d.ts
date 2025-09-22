import { type AxiosInstance } from "axios";
import type { InspectExec, CreateExecOptions as CreateExecOptions, CreateExecResponse, ResizeExecOptions, StartExecOptions } from "../../typing/exec";
import type { If } from "../../typing/global";
import { DockerStream } from "../lib/stream";
export declare class Exec {
    private api;
    constructor(api: AxiosInstance);
    /**
     * Run new commands inside running containers. Refer to the command-line reference for more information.
     *
     * To exec a command in a container, you first need to create an exec instance, then start it. These two API endpoints are wrapped up in a single command-line command, `docker exec`.
     *
     * @param id ID or name of container
     * @see https://docs.docker.com/engine/reference/commandline/exec/
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ContainerExec
     */
    create(id: string, options?: CreateExecOptions): Promise<CreateExecResponse>;
    /**
     * Starts a previously set up exec instance. If detach is true, this endpoint returns immediately after starting the command. Otherwise, it sets up an interactive session with the command.
     * @param id Exec instance ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecStart
     */
    start<IsDetach extends boolean = false>(id: string, options?: StartExecOptions<IsDetach>): Promise<If<IsDetach, string, DockerStream>>;
    /**
     * Resize the TTY session used by an exec instance. This endpoint only works if `tty` was specified as part of creating and starting the exec instance.
     * @param id Exec instance ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecResize
     */
    resize(id: string, options: ResizeExecOptions): Promise<void>;
    /**
     * Return low-level information about an exec instance.
     * @param id Exec instance ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecInspect
     */
    inspect(id: string): Promise<InspectExec>;
}

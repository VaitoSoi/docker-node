import { type AxiosInstance } from "axios";
import type { InspectContainer, CreateContainerOption, CreateContainerResponse, ContainerListFilter, ContainerFilesystemChange, ContainerUsage, ContainerUpdateOption, ContainerUpdateResponse, PruneContainerFilter, PruneContainer, ContainerSummary } from "../../typing/container";
import { DockerStream } from "../lib/stream";
export declare class Container {
    private api;
    constructor(api: AxiosInstance);
    /**
     * Returns a list of containers.
     * Note that it uses a different, smaller representation of a container than inspecting a single container.
     *
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerList
     */
    list(options?: {
        /** Return all containers. By default, only running containers are shown. */
        all?: boolean;
        /** Return this number of most recently created containers, including non-running ones. */
        limit?: number;
        /** Return the size of container as fields `SizeRw` and `SizeRootFs` */
        size?: boolean;
        /** Filters to process on the container list */
        filter?: ContainerListFilter;
    }): Promise<ContainerSummary[]>;
    /**
     * Create a container
     * @param option Container to create
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerCreate
     */
    create(option: CreateContainerOption): Promise<CreateContainerResponse>;
    /**
     * Return low-level information about a container.
     *
     * @param id ID or name of the container
     * @param size Return the size of container as fields `SizeRw` and `SizeRootFs`
     */
    inspect(id: string, size?: boolean): Promise<InspectContainer>;
    /**
     * On Unix systems, this is done by running the ps command. This endpoint is not supported on Windows.
     * @param id ID or name of the container
     * @param ps_args The arguments to pass to `ps`. For example, `aux`.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerTop
     */
    top(id: string, ps_args?: string): Promise<any>;
    /**
     * Returns which files in a container's filesystem have been added, deleted, or modified.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerChanges
     */
    getFilesystemChanges(id: string): Promise<ContainerFilesystemChange>;
    /**
     * Export the contents of a container as a tarball.
     * @param id ID or name of the container
     * @param path Where to save the tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerExport
     */
    export(id: string, path: string): Promise<void>;
    /**
     * Returns container’s resource usage statistics.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStats
     */
    stats(id: string): Promise<ContainerUsage>;
    /**
     * Start a container
     *
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStart
     */
    start(id: string): Promise<void>;
    /**
     * Stop a container
     *
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @param timeout Number of seconds to wait before killing the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStop
     */
    stop(id: string, option?: {
        signal?: string;
        timeout?: number;
    }): Promise<void>;
    /**
     * Restart a container
     *
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @param timeout Number of seconds to wait before killing the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRestart
     */
    restart(id: string, option?: {
        /** Signal to send to the container as an integer or string (e.g. `SIGINT`) */
        signal?: string;
        /** Number of seconds to wait before killing the container */
        timeout?: number;
    }): Promise<void>;
    /**
     * Kill a container
     *
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerKill
     */
    kill(id: string, signal?: string): Promise<void>;
    /**
     * Change various configuration options of a container without having to recreate it.
     * @param id ID or name of the container
     * @param option
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUpdate
     */
    update(id: string, option: ContainerUpdateOption): Promise<ContainerUpdateResponse>;
    /**
     * Rename a container
     *
     * @param id ID or name of the container
     * @param newName New name for the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRename
     */
    rename(id: string, newName: string): Promise<void>;
    /**
     * Use the freezer cgroup to suspend all processes in a container.
     *
     * Traditionally, when suspending a process the `SIGSTOP` signal is used, which is observable by the process being suspended. With the freezer cgroup the process is unaware, and unable to capture, that it is being suspended, and subsequently resumed.
     *
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPause
     */
    pause(id: string): Promise<void>;
    /**
     * Resume a container which has been paused.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUnpause
     */
    unpause(id: string): Promise<void>;
    /**
     * Block until a container stops, then returns the exit code.
     * @param id ID or name of the container
     * @param condition Wait until a container state reaches the given condition.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerWait
     */
    wait(id: string, condition?: "not-running" | "next-exit" | "removed"): Promise<void>;
    /**
     * Remove a container
     * @param id ID or name of the container
     * @param volume Remove anonymous volumes associated with the container.
     * @param force If the container is running, kill it before removing it.
     * @param link Remove the specified link associated with the container.
     */
    remove(id: string, option?: {
        /** Remove anonymous volumes associated with the container. */
        volume?: boolean;
        /** If the container is running, kill it before removing it. */
        force?: boolean;
        /** Remove the specified link associated with the container. */
        link?: boolean;
    }): Promise<void>;
    /**
     * Get information about files in a container
     * @param id ID or name of the container
     * @param path Resource in the container’s filesystem to archive.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchiveInfo
     */
    pathStat(id: string, path: string): Promise<object>;
    /**
     * Get a tar archive of a resource in the filesystem of container id.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchive
     */
    archive(id: string, option: {
        /** Resource in the container’s filesystem to archive. */
        containerPath: string;
        /** Where to save the tar file */
        outputPath: string;
    }): Promise<void>;
    /**
     * Upload a tar archive to be extracted to a path in the filesystem of container id. `path` parameter is asserted to be a directory. If it exists as a file, 400 error will be returned with message "not a directory".
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/PutContainerArchive
     */
    upload(id: string, option: {
        /** Where to pick the directory */
        inputPath: string;
        /** Path to a directory in the container to extract the archive’s contents into. */
        containerPath: string;
        /** If `true` then it will be an error if unpacking the given content would cause an existing directory to be replaced with a non-directory and vice versa. */
        noOverwriteDirNonDir: boolean;
        /** If `true` then it will copy UID/GID maps to the dest file or dir */
        copyUIDGID: boolean;
    }): Promise<void>;
    /**
     * Delete stopped containers
     * @param filters Filters
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPrune
     */
    prune(filters?: PruneContainerFilter): Promise<PruneContainer>;
    /**
     * Attach to a container to read its output or send it input.
     * @param id ID or name of the container
     * @param option
     * @returns
     */
    attach(id: string, option: {
        /**
         * Replay previous logs from the container.
         *
         * This is useful for attaching to a container that has started and you want to output everything since the container started.
         *
         * If stream is also enabled, once all the previous output has been returned, it will seamlessly transition into streaming current output.
         */
        logs: boolean;
        /** Stream attached streams from the time the request was made onwards. */
        stream: boolean;
        /** Attach to stdin */
        stdin?: boolean;
        /** Attach to stdout */
        stdout: boolean;
        /** Attach to stderr */
        stderr?: boolean;
    }): Promise<DockerStream>;
}

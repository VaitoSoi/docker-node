import type { Env } from "./global";

/*
 * Create exec
 */
export interface CreateExecOptions {
    /** Attach to `stdin` of the exec command. */
    AttachStdin?: boolean,
    /** Attach to `stdout` of the exec command. */
    AttachStdout?: boolean,
    /** Attach to `stderr` of the exec command. */
    AttachStderr?: boolean,
    /** Initial console size, as an `[height, width]` array. */
    ConsoleSize?: [number, number],
    /** Override the key sequence for detaching a container. Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,` or `_`. */
    DetachKeys?: string,
    /** Allocate a pseudo-TTY. */
    Tty?: boolean,
    /** A list of environment variables in the form `["VAR=value", ...]`. */
    Env?: Env[],
    /** Command to run, as a string or array of strings. */
    Cmd?: string[],
    /** Runs the exec process with extended privileges. */
    Privileged?: boolean,
    /** The user, and optionally, group to run the exec process inside the container. Format is one of: `user`, `user:group`, `uid`, or `uid:gid`. */
    User?: string,
    /** The working directory for the exec process inside the container. */
    WorkingDir?: string
}

export interface CreateExecResponse {
    /** The id of the newly created object. */
    Id: string,
}

/* 
 * Start exec
 */
export interface StartExecOptions<IsDetach extends boolean = false> {
    /** Detach from the command. */
    Detach: IsDetach,
    /** Allocate a pseudo-TTY. */
    Tty?: boolean,
    /** Initial console size, as an `[height, width]` array. */
    ConsoleSize?: [number, number]
}

/*
 * Resize exec
 */
export interface ResizeExecOptions {
    /** Height of the TTY session in characters */
    h: number,
    /** Width of the TTY session in characters */
    w: number,
}

/*
 * Inspect exec
 */
export interface InspectExec {
    CanRemove: boolean,
    DetachKeys: string,
    ID: string,
    Running: boolean,
    ExitCode: number,
    ProcessConfig: {
        privileged: boolean,
        user: string,
        tty: boolean,
        entrypoint: string,
        arguments: string[]
    },
    OpenStdin: boolean,
    OpenStderr: boolean,
    OpenStdout: boolean,
    ContainerID: boolean,
    /** The system process ID for the exec process. */
    Pid: number,
}

export type StringObject = Record<string, string>
export type If<Condition extends boolean, A, B = null> =
    Condition extends true ? A : Condition extends false ? B : A | B
export type IfOmitted<Condition extends boolean, A> = If<Condition, A, undefined>

export interface DefaultError {
    /** The error message. */
    message: string,
}

export type Env = `${string}=${string}`

export interface HealthCheck {
    /**
     * The test to perform. Possible values are:
     *  + `[]` inherit healthcheck from image or parent image
     *  + `["NONE"]` disable healthcheck
     *  + `["CMD", args...]` exec arguments directly
     *  + `["CMD-SHELL", command]` run command with system's default shell
     */
    Test: string[],
    /** The time to wait between checks in nanoseconds. It should be 0 or at least 1000000 (1 ms). 0 means inherit. */
    Interval: number,
    /** The time to wait before considering the check to have hung. It should be 0 or at least 1000000 (1 ms). 0 means inherit. */
    Timeout: number,
    /** The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit. */
    Retries: number,
    /** Start period for the container to initialize before starting health-retries countdown in nanoseconds. It should be 0 or at least 1000000 (1 ms). 0 means inherit. */
    StartPeriod: number,
    /** The time to wait between checks in nanoseconds during the start period. It should be 0 or at least 1000000 (1 ms). 0 means inherit. */
    StartInterval: number
}

export interface GraphDriver {
    /** Name of the storage driver. */
    Name: string,
    /** 
     * Low-level storage metadata, provided as key/value pairs.
     * 
     * This information is driver-specific, and depends on the storage-driver in use, and should be used for informational purposes only. 
     */
    Data: StringObject
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ExposedPorts = Record<`${string}/${"tcp" | "udp" | "sctp"}`, {}>;
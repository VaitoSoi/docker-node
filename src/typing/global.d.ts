export type StringObject = Record<string, string>
export type If<Condition extends boolean, A, B = null> =
    Condition extends true ? A : Condition extends false ? B : A | B
export type IfOmitted<Condition extends boolean, A> = If<Condition, A, undefined>

export type Env = `${string}=${string}`

export interface Ulimit {
    /** Name of ulimit */
    Name: string,
    /** Soft limit */
    Soft: number,
    /** Hard limit */
    Hard: number
}

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

export interface Resource {
    NanoCPUs: number,
    MemoryBytes: number,
    /** User-defined resources can be either Integer resources (e.g, `SSD=3`) or String resources (e.g, GPU=`UUID1`). */
    GenericResources: GenericResource[]
}

export interface GenericResource {
    NamedResourceSpec: {
        Kind: string,
        Value: string
    },
    DiscreteResourceSpec: {
        Kind: string,
        Value: string
    }
}

export interface Platform {
    /** Architecture represents the hardware architecture (for example, `x86_64`). */
    Architecture: string,
    /** OS represents the Operating System (for example, `linux` or `windows`). */
    OS: string
}

export interface TaskSpecFile {
    /** Name represents the final filename in the filesystem. */
    Name: string,
    /** UID represents the file UID. */
    UID: string,
    /** GID represents the file GID. */
    GID: string,
    /** Mode represents the FileMode of the file. */
    Mode: number
}

export interface TaskSpecNetwork {
    /** The target network for attachment. Must be a network name or ID. */
    Target: string,
    /** Discoverable alternate names for the service on this network. */
    Aliases: string[],
    /** Driver attachment options for the network target. */
    DriverOpts: StringObject
}

export interface TaskSpec {
    /** Plugin spec for the service. (Experimental release only.) */
    PluginSpec?: {
        /** The name or 'alias' to use for the plugin. */
        Name: string,
        /** The plugin image reference to use. */
        Remote: string,
        /** Disable the plugin once scheduled. */
        Disabled: boolean,
        PluginPrivilege: {
            Name: string,
            Description: string,
            Value: string[]
        }[]
    },
    /** Container spec for the service. */
    ContainerSpec?: {
        /** The image name to use for the container */
        Image: string,
        /** User-defined key/value data. */
        Labels: StringObject,
        /** The command to be run in the image. */
        Command: string[],
        /** Arguments to the command. */
        Args: string[],
        /**
         *  The hostname to use for the container, as a valid RFC 1123 hostname.
         * @see https://tools.ietf.org/html/rfc1123
         */
        Hostname: string,
        /** A list of environment variables */
        Env: Env[],
        /** The working directory for commands to run in. */
        Dir: string,
        /** The user inside the container */
        User: string,
        /** A list of additional groups that the container process will run as. */
        Groups: string[],
        /** Security options for the container */
        Privileges: {
            /** 
             * CredentialSpec for managed service account (Windows only) 
             *
             * Note: `CredentialSpec.File`, `CredentialSpec.Registry`, and `CredentialSpec.Config` are mutually exclu
             */
            CredentialSpec: {
                /** Load credential spec from a Swarm Config with the given ID. The specified config must also be present in the Configs field with the Runtime property set. */
                Config?: string,
                /** 
                 * Load credential spec from this file. The file is read by the daemon, and must be present in the `CredentialSpecs` subdirectory in the docker data directory, which defaults to `C:\ProgramData\Docker\` on Windows. 
                 * 
                 * For example, specifying `spec.json` loads `C:\ProgramData\Docker\CredentialSpecs\spec.json`.
                 */
                File?: string,
                /** 
                 * Load credential spec from this value in the Windows registry. The specified registry value must be located in:
                 *
                 *`HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Virtualization\Containers\CredentialSpecs` 
                 */
                Regisry?: string
            } | undefined,
            /** SELinux labels of the container */
            SELinuxContext: {
                /** Disable SELinux */
                Disable: boolean,
                /** SELinux user label */
                User: string,
                /** SELinux role label */
                Role: string,
                /** SELinux type label */
                Type: string,
                /** SELinux level label */
                Level: string
            },
            /** Options for configuring seccomp on the container */
            Secomp: {
                Mode: "default" | "unconfined" | "custom",
                /** The custom seccomp profile as a json object */
                Profile: string
            },
            /** Options for configuring AppArmor on the container */
            AppArmor: {
                Mode: "default" | "disabled"
            },
            /** Configuration of the `no_new_privs` bit in the container */
            NoNewPrivileges: boolean
        },
        /** Whether a pseudo-TTY should be allocated. */
        TTY: boolean,
        /** Open `stdin` */
        OpenStdin: boolean,
        /** Mount the container's root filesystem as read only. */
        ReadOnly: void,
        /** Specification for mounts to be added to containers created as part of the service. */
        Mounts: {
            /** Container path */
            Target: string,
            /** Mount source (e.g. a volume name, a host path). */
            Source: string,
            /** 
             * The mount type. Available types:
             * + `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.
             * + `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are not removed when the container is removed.
             * + `image` Mounts an image.
             * + `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.
             * + `npipe` Mounts a named pipe from the host into the container. Must exist prior to creating the container.
             * + `cluster` a Swarm cluster volume
             */
            Type: "bind" | "volume" | "image" | "tmpfs" | "npipe" | "cluster",
            /** Whether the mount should be read-only. */
            ReadOnly: boolean,
            /** The consistency requirement for the mount: `default`, `consistent`, `cached`, or `delegated`. */
            Consistency: string,
            /** Optional configuration for the `bind` type. */
            BindOptions: {
                /** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`. */
                Propagation: "private" | "rprivate" | "shared" | "rshared" | "slave" | "rslave",
                /** Disable recursive bind mount. */
                NonRecursive: boolean,
                /** Create mount point on host if missing */
                CreateMountpoint: boolean,
                /** 
                 * Make the mount non-recursively read-only, but still leave the mount recursive (unless `NonRecursive` is set to `true` in conjunction).
                 *
                 * Added in v1.44, before that version all read-only mounts were non-recursive by default. To match the previous behaviour this will default to true for clients on versions prior to v1.44. 
                 */
                ReadOnlyNonRecursive: boolean,
                /** Raise an error if the mount cannot be made recursively read-only. */
                ReadOnlyForceRecursive: boolean
            },
            /** Optional configuration for the `volume` type. */
            VolumeOptions: {
                /** Populate volume with data from the target. */
                NoCopy: boolean,
                /** User-defined key/value metadata. */
                Labels: StringObject,
                /** Map of driver specific options */
                DriverConfig: {
                    /** Name of the driver to use to create the volume. */
                    Name: string,
                    /** key/value map of driver specific options. */
                    Options: StringObject
                },
                /** Source path inside the volume. Must be relative without any back traversals. */
                Subpath: string
            },
            /** Optional configuration for the `image` type. */
            ImageOptions: {
                /** Source path inside the image. Must be relative without any back traversals. */
                Subpath: string
            }
            /** Optional configuration for the `tmpfs` type */
            TmpfsOptions: {
                /** The size for the tmpfs mount in bytes. */
                SizeBytes: number,
                /** The permission mode for the tmpfs mount in an integer. */
                Mode: never,
                /** The options to be passed to the tmpfs mount. An array of arrays. Flag options should be provided as 1-length arrays. Other types should be provided as as 2-length arrays, where the first item is the key and the second the value. */
                Options: ([any] | [any, any])[]
            },
        }[],
        /** Signal to stop the container */
        StopSignal: string,
        /** Amount of time to wait for the container to terminate before forcefully killing it. */
        StopGracePeriod: number,
        /** A test to perform to check that the container is healthy. */
        HealthCheck: HealthCheck,
        /** 
         * A list of hostname/IP mappings to add to the container's hosts file. The format of extra hosts is specified in the hosts(5) man page
         * 
         * ```
         * IP_address canonical_hostname [aliases...]
         * ```
         * 
         * @see http://man7.org/linux/man-pages/man5/hosts.5.html
         */
        Hosts: string[],
        /** Specification for DNS related configurations in resolver configuration file (`resolv.conf`). */
        DNSConfig: {
            /** The IP addresses of the name servers. */
            Nameservers: string[]
            /** A search list for host-name lookup. */
            Search: string[],
            /** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.). */
            Options: string[]
        },
        /** Secrets contains references to zero or more secrets that will be exposed to the service. */
        Secrets: {
            /** File represents a specific target that is backed by a file. */
            File: TaskSpecFile,
            /** SecretID represents the ID of the specific secret that we're referencing. */
            SecretID: string,
            /** SecretName is the name of the secret that this references, but this is just provided for lookup/display purposes. The secret in the reference will be identified by its ID. */
            SecretName: string,
        }[],
        /** An integer value containing the score given to the container in order to tune OOM killer preferences. */
        OomScoreAdj: number,
        /** 
         * Configs contains references to zero or more configs that will be exposed to the service. 
         * 
         * Note: `Configs.File` and `Configs.Runtime` are mutually exclusive
         */
        Configs: {
            /** File represents a specific target that is backed by a file. */
            File: TaskSpecFile,
            /** Runtime represents a target that is not mounted into the container but is used by the task */
            Runtime: object,
            /** ConfigID represents the ID of the specific config that we're referencing. */
            ConfigId: string,
            /** ConfigName is the name of the config that this references, but this is just provided for lookup/display purposes. The config in the reference will be identified by its ID. */
            ConfigName: string
        }[],
        /** Isolation technology of the containers running the service. (Windows only) */
        Isolation: "default" | "process" | "hyperv" | "" | undefined,
        /** Run an init inside the container that forwards signals and reaps processes. This field is omitted if empty, and the default (as configured on the daemon) is used. */
        Init: boolean | null,
        /** Set kernel namedspaced parameters (sysctls) in the container. The Sysctls option on services accepts the same sysctls as the are supported on containers. Note that while the same sysctls are supported, no guarantees or checks are made about their suitability for a clustered environment, and it's up to the user to determine whether a given sysctl will work properly in a Service. */
        Sysctls: StringObject,
        /** A list of kernel capabilities to add to the default set for the container. */
        CapabilityAdd: string[],
        /** A list of kernel capabilities to drop from the default set for the container. */
        CapabilityDrop: string[],
        /** A list of resource limits to set in the container.  */
        Ulimits: Ulimit[]
    },
    /** Read-only spec type for non-swarm containers attached to swarm overlay networks. */
    NetworkAttachmentSpec: {
        /** ID of the container represented by this task */
        ContainerID: string
    },
    /** Resource requirements which apply to each individual container created as part of the service. */
    Resources: {
        /** An object describing a limit on resources which can be requested by a task. */
        Limits: {
            NanoCPUs: number,
            MemoryBytes: number,
            /** Limits the maximum number of PIDs in the container. Set `0` for unlimited. */
            Pids: number
        },
        /** An object describing the resources which can be advertised by a node and requested by a task. */
        Reservations: Resource,
    },
    /** Specification for the restart policy which applies to containers created as part of this service. */
    RestartPolicy: {
        /** Condition for restart. */
        Condition: "none" | "on-failure" | "any",
        /** Delay between restart attempts. */
        Delay: number,
        /** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). */
        MaxAttempts: number,
        /** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). */
        Window: number
    },
    Placement: {
        /** 
         * An array of constraint expressions to limit the set of nodes where a task can be scheduled. Constraint expressions can either use a match (`==`) or exclude (`!=`) rule. Multiple constraints find nodes that satisfy every expression (AND match). Constraints can match node or Docker Engine labels as follows:
         *
         * | node attribute     | matches                    | example                                     |
         * |--------------------|----------------------------|---------------------------------------------|
         * | node.id            | Node ID                    | node.id==2ivku8v2gvtg4z                     |
         * | node.hostname      | Node hostname              | node.hostname!=node-2                       |
         * | node.role          | Node role (manager/worker) | node.role==manager                          |
         * | node.platform.os   | Node operating system      | node.platform.os==windows                   |
         * | node.platform.arch | Node architecture	         | node.platform.arch==x86_64                  |
         * | node.labels        | User-defined node labels   | node.labels.security==high                  |
         * | engine.labels      | Docker Engine's labels     | engine.labels.operatingsystem==ubuntu-24.04 |
         * 
         * `engine.labels` apply to Docker Engine labels like operating system, drivers, etc. Swarm administrators add `node.labels` for operational purposes by using the `node update endpoint`.
         */
        Constraints: string,
        /** Preferences provide a way to make the scheduler aware of factors such as topology. They are provided in order from highest to lowest precedence. */
        Preferences: {
            Spread: {
                /** label descriptor, such as `engine.labels.az`. */
                SpreadDescriptor: string
            }
        }[],
        /** Maximum number of replicas for per node (default value is 0, which is unlimited) */
        MaxReplicas: number,
        /** Platforms stores all the platforms that the service's image can run on. This field is used in the platform filter for scheduling. If empty, then the platform filter is off, meaning there are no scheduling restrictions. */
        Platforms: Platform
    },
    /** A counter that triggers an update even if no relevant parameters have been changed. */
    ForceUpdate: number,
    /** Runtime is the type of runtime specified for the task executor. */
    Runtime: string,
    /** Specifies which networks the service should attach to. */
    Networks: TaskSpecNetwork[],
    /** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified. */
    LogDriver: {
        Name: string,
        Options: StringObject
    }
}

export interface EndpointPortConfig {
    Name: string,
    Protocol: "tcp" | "udp" | "sctp",
    /** The port inside the container. */
    TargetPort: number,
    /** The port on the swarm hosts. */
    PublishedPort: number,
    /** 
     * The mode in which port is published:
     * + "ingress" makes the target port accessible on every node, regardless of whether there is a task for the service running on that node or not.
     * + "host" bypasses the routing mesh and publish the port directly on the swarm node where that service is running.
     */
    PublishMode: "ingress" | "host"
}

export interface SwarmShareLogOption {
    /** Show service context and extra details provided to logs. */
    details?: boolean,
    /** Keep connection after returning logs */
    follow?: boolean,
    /** Return logs from `stdout` */
    stdout: boolean,
    /** Return logs from `stderr` */
    stderr?: boolean,
    /** Only return logs since this time, as a UNIX timestamp */
    since?: number,
    /** Add timestamps to every log line */
    timestamps?: boolean,
    /** Only return this number of log lines from the end of the logs. Specify as an integer or `all` to output all log lines. */
    tail?: number | "all"
}

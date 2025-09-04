import type { ImageManifestDescriptor } from "./image";
import type { Env, ExposedPorts, GraphDriver, HealthCheck, If, IfOmitted, StringObject } from "./main";


export interface Ulimit {
    /** Name of ulimit */
    Name: string,
    /** Soft limit */
    Soft: number,
    /** Hard limit */
    Hard: number
}

export type ContainerStatus = "created" | "running" | "paused" | "restarting" | "exited" | "removing" | "dead";

export interface ContainerMount<IsOnLinux extends boolean> {
    /**
     * The mount type:
     * + `bind` a mount of a file or directory from the host into the container.
     * + `volume` a docker volume with the given Name.
     * + `image` a docker image
     * + `tmpfs` a tmpfs.
     * + `npipe` a named pipe from the host into the container.
     * + `cluster` a Swarm cluster volume
     */
    Type: "bind" | "volume" | "image" | "tmpfs" | "npipe" | "cluster",
    /** Name is the name reference to the underlying data defined by Source e.g., the volume name. */
    Name: string,
    /** Source location of the mount. */
    Source: string,
    /** Destination is the path relative to the container root (/) where the Source is mounted inside the container. */
    Destination: string,
    /** Driver is the volume driver used to create the volume (if it is a volume). */
    Driver: string,
    /** Mode is a comma separated list of options supplied by the user when creating the bind/volume mount. */
    Mode: string,
    /** Whether the mount is mounted writable (read-write). */
    RW: boolean,
    /** 
     * Propagation describes how mounts are propagated from the host into the mount point, and vice-versa. This field is not used on Windows.
     * 
     * @see https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt
     */
    Propagation: IfOmitted<IsOnLinux, string>
}

export interface ContainerNetwork {
    [name: string]: {
        /** EndpointIPAMConfig represents an endpoint's IPAM configuration. */
        IPAMConfig: {
            IPv4Address: string,
            IPv6Address: string,
            LinkLocalIPs: string[]
        },
        Links: string[],
        /** MAC address for the endpoint on this network. The network driver might ignore this parameter. */
        MacAddress: string,
        Aliases: string[],
        /** DriverOpts is a mapping of driver options and values. These options are passed directly to the driver and are driver specific. */
        DriverOpts: StringObject | null,
        /** This property determines which endpoint will provide the default gateway for a container.  */
        GwPriority: number,
        /** Unique ID of the network. */
        NetworkID: string,
        /** Unique ID for the service endpoint in a Sandbox. */
        EndpointID: string,
        /** Gateway address for this network. */
        Gateway: string,
        /** IPv4 address. */
        IPAddress: string,
        /** Mask length of the IPv4 address. */
        IPPrefixLen: number,
        /** IPv6 gateway address. */
        IPv6Gateway: string,
        /** Global IPv6 address. */
        GlobalIPv6Address: string,
        /** Mask length of the global IPv6 address. */
        GlobalIPv6PrefixLen: number,
        /** List of all DNS names an endpoint has on a specific network. */
        DNSNames: string[]
    }
}

export interface ContainerPort {
    /** Host IP address that the container's port is mapped to. */
    IP: string,
    /** Port on the container. */
    PrivatePort: number,
    /** Port exposed on the host. */
    PublicPort: string,
    Type: "tcp" | "udp" | "sctp"
}

export interface ContainerDevice {
    PathOnHost: string,
    PathInContainer: string,
    CgroupPermissions: string
}

export interface ContainerDeviceRequest {
    Driver: string,
    Count: number,
    DeviceIDs: string[]
    /** A list of capabilities; an OR list of AND lists of capabilities. */
    Capabilities: string[],
    /** Driver-specific options, specified as a key/value pairs. These options are passed directly to the driver. */
    Options: StringObject
}

export interface ContainerRestartPolicy {
    /** 
     * + Empty string means not to restart
     * + `no` Do not automatically restart
     * + `always` Always restart
     * + `unless-stopped` Restart always except when the user has manually stopped the container
     * + `on-failure` Restart only when the container exit code is non-zero
     */
    Name: "" | "no" | "always" | "unless-stopped" | "on-failure",
    /** If on-failure is used, the number of times to retry before giving up. */
    MaximumRetryCount: number
}

/*
 * Get containers
 */
export interface ListContainer<IsOnLinux extends boolean> {
    /** The ID of this container. */
    Id: string,
    /** The names associated with this container. */
    Names: string[],
    /** The name or ID of the image used to create the container. */
    Image: string,
    /** The ID (digest) of the image that this container was created from. */
    ImageID: string,
    /** 
     * A descriptor struct containing digest, media type, and size, as defined in the OCI Content Descriptors Specification.
     *
     * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/descriptor.md
     */
    ImageManifestDescriptor: ImageManifestDescriptor,
    /** Command to run when starting the container. */
    Command: string,
    /** Date and time at which the container was created as a Unix timestamp */
    Created: number,
    /** Port-mappings for the container. */
    Ports: ContainerPort[],
    /** The size of files that have been created or changed by this container. */
    SizeRw: number | null,
    /** The total size of all files in the read-only layers from the image that the container uses. */
    SizeRootFs: number | null,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** The state of this container. */
    State: ContainerStatus,
    /** Additional human-readable status of this container. */
    Status: string,
    /** Summary of host-specific runtime information of the container. */
    HostConfig: {
        /** Networking mode (`host`, `none`, `container:<id>`) or name of the primary network the container is using. */
        NetworkMode: "host" | "none" | `container:${string}`,
        /** Arbitrary key-value metadata attached to the container. */
        Annotations: StringObject | null
    },
    /** Summary of the container's network settings. */
    NetworkSettings: {
        /** Summary of network-settings for each network the container is attached to. */
        Networks: ContainerNetwork
    },
    Mounts: ContainerMount<IsOnLinux>[]
}

export interface ListFilter {
    ancestor: string,
    before: string,
    expose: string,
    exited: number,
    health: "starting" | "healthy" | "unhealthy" | "none",
    id: string,
    isolation: "default" | "process" | "hyperv" | undefined,
    "is-task": boolean,
    label: string[],
    name: string,
    network: string,
    publish: string,
    since: string,
    status: ContainerStatus,
}

/*
 * Create container
 */

export interface CreateContainerOption extends CreateContainer {
    /** Assign the specified name to the container */
    Name?: string,
    /** Platform in the format `os[/arch[/variant]]` used for image lookup */
    Platform?: string,
}

export interface CreateContainer {
    /** The hostname to use for the container, as a valid RFC 1123 hostname. */
    Hostname?: string,
    /** The domain name to use for the container. */
    Domainname?: string,
    /** Commands run as this user inside the container. If omitted, commands run as the user specified in the image the container was started from. */
    User?: string,
    /** Whether to attach to `stdin`. */
    AttachStdin?: boolean,
    /** Whether to attach to `stdout`. */
    AttachStdout?: boolean,
    /** Whether to attach to `stderr`. */
    AttachStderr?: boolean,
    /** An object mapping ports to an empty object */
    ExposedPorts?: ExposedPorts,
    /** Attach standard streams to a TTY, including `stdin` if it is not closed. */
    Tty?: boolean,
    /** Open `stdin` */
    OpenStdin?: boolean,
    /** Close `stdin` after one attached client disconnects. */
    StdinOnce?: boolean,
    /** A list of environment variables to set inside the container. */
    Env?: Env[],
    /** Command to run specified as a string or an array of strings. */
    Cmd?: string[],
    /** A test to perform to check that the container is healthy. */
    HealthCheck?: HealthCheck,
    /** Command is already escaped (Windows only) */
    ArgsEscaped?: boolean | null,
    /** The name (or reference) of the image to use when creating the container, or which was used when the container was created. */
    Image: string,
    /** An object mapping mount point paths inside the container to empty objects. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Volumes?: Record<string, {}>,
    /** The working directory for commands to run in. */
    WorkingDir?: string,
    /** 
     * The entry point for the container as a string or an array of strings. 
     * If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).
    */
    Entrypoint?: string[],
    /** Disable networking for the container. */
    NetworkDisabled?: boolean | null,
    /**
     * MAC address of the container.
     * 
     * @deprecated Use EndpointSettings.MacAddress instead.
     */
    MacAddress?: string | null,
    /** `ONBUILD` metadata that were defined in the image's `Dockerfile`. */
    OnBuild?: string[] | null,
    /** User-defined key/value metadata. */
    Labels?: StringObject,
    /** Signal to stop a container as a string or unsigned integer. */
    StopSignal?: string | null,
    /** Timeout to stop a container in seconds. */
    StopTimeout?: number | null,
    /** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell. */
    Shell?: string[] | null,
}

export interface CreateContainerResponse {
    /** The ID of the created container. */
    Id: string,
    /** Warnings encountered when creating the container. */
    Warnings: string[]
}


/*
 * Inspect container ;-;
 */

export interface ContainerState {
    /** String representation of the container state.  */
    Status: ContainerStatus,
    /** 
     * Whether this container is running. 
     * 
     * Note that a running container can be paused. The Running and Paused booleans are not mutually exclusive:
     *
     * When pausing a container (on Linux), the freezer cgroup is used to suspend all processes in the container. Freezing the process requires the process to be running. As a result, paused containers are both Running and Paused.
     * 
     * Use the Status field instead to determine if a container's state is "running".
     */
    Running: boolean,
    /** Whether this container is paused. */
    Paused: boolean,
    /** Whether this container is restarting. */
    Restarting: boolean,
    /** Whether a process within this container has been killed because it ran out of memory since the container was last started. */
    OOMKilled: boolean,
    Dead: boolean,
    /** The process ID of this container. */
    Pid: number,
    /** The last exit code of this container. */
    ExitCode: number,
    Error: string,
    /** The time when this container was last started. */
    StartedAt: string,
    /** The time when this container last exited. */
    FinishedAt: string,
    /** Health stores information about the container's healthcheck results. */
    Health: {
        /** 
         * + `none` Indicates there is no healthcheck
         * + `starting` Starting indicates that the container is not yet ready
         * + `healthy` Healthy indicates that the container is running correctly
         * + `unhealthy` Unhealthy indicates that the container has a problem 
         */
        Status: "none" | "starting" | "healthy" | "unhealthy",
        /** Number of consecutive failures. */
        FailingStreak: number,
        Log: {
            /** 
             * Date and time at which this check started in RFC 3339 format with nano-seconds.
             * 
             * @see https://www.ietf.org/rfc/rfc3339.txt
             */
            Start: string,
            /** 
             * Date and time at which this check ended in RFC 3339 format with nano-seconds.
             * 
             * @see https://www.ietf.org/rfc/rfc3339.txt
             */
            End: string,
            /** 
             * + `0` healthy
             * + `1` unhealthy
             * + `2` reserved (considered unhealthy)
             * + other values: error running probe 
             */
            ExitCode: number,
            /** Output from last check */
            Output: string
        }[] | null
    } | null
}

export interface ContainerBlkioDevice {
    /** Device path */
    Path: string,
    /** Rate */
    Rate: number
}

export interface ContainerHostConfig<IsOnLinux extends boolean> {
    /** An integer value representing this container's relative CPU weight versus other containers. */
    CpuShares: number,
    /** Memory limit in bytes. */
    Memory: number,
    /** Path to `cgroups` under which the container's `cgroup` is created. If the path is not absolute, the path is considered to be relative to the `cgroups` path of the init process. Cgroups are created if they do not already exist. */
    CgroupParent: string,
    /** Block IO weight (relative weight). */
    BlkioWeight: number,
    /** Block IO weight (relative device weight). */
    BlkioWeightDevice: {
        Path: string,
        Weight: number
    }[],
    /** Limit read rate (bytes per second) from a device. */
    BlkioDeviceReadBps: ContainerBlkioDevice[],
    /** Limit write rate (bytes per second) to a device. */
    BlkioDeviceWriteBps: ContainerBlkioDevice[],
    /** Limit read rate (IO per second) from a device. */
    BlkioDeviceReadIOps: ContainerBlkioDevice[],
    /** Limit write rate (IO per second) to a device. */
    BlkioDeviceWriteIOps: ContainerBlkioDevice[],
    /** The length of a CPU period in microseconds. */
    CpuPeriod: number,
    /** Microseconds of CPU time that the container can get in a CPU period. */
    CpuQuota: number,
    /** The length of a CPU real-time period in microseconds. Set to 0 to allocate no time allocated to real-time tasks. */
    CpuRealtimePeriod: number,
    /** The length of a CPU real-time runtime in microseconds. Set to 0 to allocate no time allocated to real-time tasks. */
    CpuRealtimeRuntime: number,
    /** CPUs in which to allow execution (e.g., `0-3`, `0,1`). */
    CpusetCpus: string,
    /** Memory nodes (MEMs) in which to allow execution (0-3, 0,1). Only effective on NUMA systems. */
    CpusetMems: string,
    /** A list of devices to add to the container. */
    Devices: ContainerDevice[],
    /** A list of cgroup rules to apply to the container. */
    DeviceCgroupRules: string[],
    /** A list of requests for devices to be sent to device drivers. */
    DeviceRequests: ContainerDeviceRequest[],
    /**
     * Hard limit for kernel TCP buffer memory (in bytes). Depending on the OCI runtime in use, this option may be ignored. It is no longer supported by the default (runc) runtime.
     *
     * This field is omitted when empty. 
     * */
    KernelMemoryTCP: number | undefined,
    /** Memory soft limit in bytes. */
    MemoryReservation: number,
    /** Total memory limit (memory + swap). Set as `-1` to enable unlimited swap. */
    MemorySwap: number,
    /** Tune a container's memory swappiness behavior. Accepts an integer between 0 and 100. */
    MemorySwappiness: number,
    /** CPU quota in units of 10^-9 CPUs. */
    NanoCpus: number,
    /** Disable OOM Killer for the container. */
    OomKillDisable: boolean,
    /** Run an init inside the container that forwards signals and reaps processes. This field is omitted if empty, and the default (as configured on the daemon) is used. */
    Init: boolean | null,
    /** Tune a container's PIDs limit. Set `0` or `-1` for unlimited, or `null` to not change. */
    PidsLimit: number | null,
    /** A list of resource limits to set in the container. */
    Ulimits: Ulimit[],
    /** 
     * The number of usable CPUs (Windows only).
     * 
     * On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is CPUCount first, then CPUShares, and CPUPercent last.
     */
    CpuCount: If<IsOnLinux, undefined, number>,
    /** 
     * The usable percentage of the available CPUs (Windows only).
     * 
     * On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is CPUCount first, then CPUShares, and CPUPercent last.
     */
    CpuPercent: If<IsOnLinux, undefined, number>,
    /** Maximum IOps for the container system drive (Windows only) */
    IOMaximumIOps: If<IsOnLinux, undefined, number>,
    /** Maximum IO in bytes per second for the container system drive (Windows only). */
    IOMaximumBandwidth: If<IsOnLinux, undefined, number>,
    /**
     * A list of volume bindings for this container. Each volume binding is a string in one of these forms:
     * + `host-src:container-dest[:options]` to bind-mount a host path into the container. Both host-src, and container-dest must be an absolute path.
     * + `volume-name:container-dest[:options]` to bind-mount a volume managed by a volume driver into the container. container-dest must be an absolute path.
     * 
     * `options` is an optional, comma-delimited list of:
     * + `nocopy` disables automatic copying of data from the container path to the volume. The nocopy flag only applies to named volumes.
     * + `[ro|rw]` mounts a volume read-only or read-write, respectively. If omitted or set to rw, volumes are mounted read-write.
     * + `[z|Z]` applies SELinux labels to allow or deny multiple containers to read and write to the same volume.
     *   + `z`: a shared content label is applied to the content. This label indicates that multiple containers can share the volume content, for both reading and writing.
     *   + `Z`: a private unshared label is applied to the content. This label indicates that only the current container can use a private volume. Labeling systems such as SELinux require proper labels to be placed on volume content that is mounted into a container. Without a label, the security system can prevent a container's processes from using the content. By default, the labels set by the host operating system are not modified.
     * + `[[r]shared|[r]slave|[r]private]` specifies mount propagation behavior. This only applies to bind-mounted volumes, not internal volumes or named volumes. Mount propagation requires the source mount point (the location where the source directory is mounted in the host operating system) to have the correct propagation properties. For shared volumes, the source mount point must be set to `shared`. For slave volumes, the mount must be set to either `shared` or `slave`.
     * 
     * @see https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt
     */
    Binds: (`${string}:${string}` | `${string}:${string}:${string}`)[],
    /** Path to a file where the container ID is written */
    ContainerIDFile: string,
    /** The logging configuration for this container */
    LogConfig: {
        /** Name of the logging driver used for the container or "none" if logging is disabled. */
        Type: "local" | "json-file" | "syslog" | "journald" | "gelf" | "fluentd" | "awslogs" | "splunk" | "etwlogs" | "none",
        /** Driver-specific configuration options for the logging driver. */
        Config: StringObject
    },
    /** Network mode to use for this container. Supported standard values are: `bridge`, `host`, `none`, and `container:<name|id>`. Any other value is taken as a custom network's name to which this container should connect to. */
    NetworkMode: string,
    /** 
     * PortMap describes the mapping of container ports to host ports, using the container's port-number and protocol as key in the format `<port>/<protocol>`, for example, `80/udp`.
     * 
     * If a container's port is mapped for multiple protocols, separate entries are added to the mapping table.
     */
    PortBindings: {
        [name: string]: {
            /** Host IP address that the container's port is mapped to. */
            HostIp: string,
            /** Host port number that the container's port is mapped to. */
            HostPort: string
        }[] | null
    },
    /** 
     * The behavior to apply when the container exits. The default is not to restart.
     *
     * An ever increasing delay (double the previous delay, starting at 100ms) is added before each restart to prevent flooding the server.
     */
    RestartPolicy: ContainerRestartPolicy,
    /** Automatically remove the container when the container's process exits. This has no effect if `RestartPolicy` is set. */
    AutoRemove: boolean,
    /** Driver that this container uses to mount volumes. */
    VolumeDriver: string,
    /** A list of volumes to inherit from another container, specified in the form `<container name>[:<ro|rw>]`. */
    VolumesFrom: (`${string}` | `${string}:ro` | `${string}:rw`)[],
    /** Specification for mounts to be added to the container. */
    Mounts: {
        /** Container path. */
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
        /** Optional configuration for the bind type. */
        BindOptions: {
            /** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`. */
            Propagation: "private" | "rprivate" | "shared" | "rshared" | "slave" | "rslave",
            /** Disable recursive bind mount. */
            NonRecursive: boolean,
            /** Create mount point on host if missing. */
            CreateMountpoint: boolean,
            /** 
             * Make the mount non-recursively read-only, but still leave the mount recursive (unless NonRecursive is set to `true` in conjunction).
             * 
             * Added in v1.44, before that version all read-only mounts were non-recursive by default. To match the previous behaviour this will default to `true` for clients on versions prior to v1.44.
             */
            ReadOnlyNonRecursive: boolean,
            /** Raise an error if the mount cannot be made recursively read-only. */
            ReadOnlyForceRecursive: boolean,
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
        },
        /** Optional configuration for the tmpfs type. */
        TmpfsOptions: {
            /** The size for the tmpfs mount in bytes. */
            SizeBytes: number,
            /** The permission mode for the tmpfs mount in an integer. */
            Mode: number,
            /** The options to be passed to the tmpfs mount. An array of arrays. Flag options should be provided as 1-length arrays. Other types should be provided as as 2-length arrays, where the first item is the key and the second the value. */
            Options: [string] | [string, string]
        }
    }[]
    /** Initial console size, as an `[height, width]` array. */
    ConsoleSize: [number, number] | null,
    /** Arbitrary non-identifying metadata attached to container and provided to the runtime when the container is started. */
    Annotations: StringObject,
    /** A list of kernel capabilities to add to the container. Conflicts with option 'Capabilities'. */
    CapAdd: string[],
    /** A list of kernel capabilities to drop from the container. Conflicts with option 'Capabilities'. */
    CapDrop: string[],
    /** 
     * cgroup namespace mode for the container. Possible values are:
     * + `private` the container runs in its own private cgroup namespace
     * + `host` use the host system's cgroup namespace
     * + If not specified, the daemon default is used, which can either be `private` or `host`, depending on daemon version, kernel support and configuration.
     */
    CgroupnsMode: "private" | "host",
    /** A list of DNS servers for the container to use. */
    Dns: string[],
    /** A list of DNS options. */
    DnsOptions: string[],
    /** A list of DNS search domains. */
    DnsSearch: string[],
    /** A list of hostnames/IP mappings to add to the container's `/etc/hosts` file. Specified in the form `["hostname:IP"]`. */
    ExtraHosts: `${string}:${string}`[],
    /** A list of additional groups that the container process will run as. */
    GroupAdd: string,
    /** 
     * IPC sharing mode for the container. Possible values are:
     * + `none` own private IPC namespace, with /dev/shm not mounted
     * + `private` own private IPC namespace
     * + `shareable` own private IPC namespace, with a possibility to share it with other containers
     * + `container:<name|id>` join another (shareable) container's IPC namespace
     * + `host` use the host system's IPC namespace
     * If not specified, daemon default is used, which can either be "private" or "shareable", depending on daemon version and configuration.
     */
    IpcMode: string,
    /** Cgroup to use for the container. */
    Cgroup: string,
    /** A list of links for the container in the form `container_name:alias`. */
    Links: `${string}:${string}`[],
    /** An integer value containing the score given to the container in order to tune OOM killer preferences. */
    OomScoreAdj: number,
    /** 
     * Set the PID (Process) Namespace mode for the container. It can be either:
     * + `container:<name|id>` joins another container's PID namespace
     * + `host` use the host's PID namespace inside the container
     */
    PidMode: `${string}:${string}` | "host",
    /** Gives the container full access to the host. */
    Privileged: boolean,
    /**
     * Allocates an ephemeral host port for all of a container's exposed ports.
     * 
     * Ports are de-allocated when the container stops and allocated when the container starts. The allocated port might be changed when restarting the container.
     * 
     * The port is selected from the ephemeral port range that depends on the kernel. For example, on Linux the range is defined by /proc/sys/net/ipv4/ip_local_port_range.
     */
    PublishAllPorts: boolean,
    /** Mount the container's root filesystem as read only. */
    ReadonlyRootfs: boolean,
    /** A list of string values to customize labels for MLS systems, such as SELinux. */
    SecurityOpt: string[],
    /** Storage driver options for this container.. */
    StorageOpt: {
        size: string
    } | StringObject,
    /** 
     * A map of container directories which should be replaced by tmpfs mounts, and their corresponding mount options. For example:
     * ```json
     * { "/run": "rw,noexec,nosuid,size=65536k" } 
     * ```
     * */
    Tmpfs: StringObject,
    /** UTS namespace to use for the container. */
    UTSMode: string,
    /** Sets the usernamespace mode for the container when usernamespace remapping option is enabled. */
    UsernsMode: string,
    /** Size of /dev/shm in bytes. If omitted, the system uses `64MB`. */
    ShmSize: number | undefined,
    /** 
     * A list of kernel parameters (sysctls) to set in the container.
     * 
     * This field is omitted if not set. 
     * */
    Sysctls: StringObject | null | undefined,
    /** Runtime to use with this container. */
    Runtime: string | null,
    /** Isolation technology of the container. (Windows only) */
    Isolation: If<IsOnLinux, undefined, "default" | "process" | "hyperv" | "">,
    /** The list of paths to be masked inside the container (this overrides the default set of paths). */
    MaskedPaths: string[],
    /** The list of paths to be set as read-only inside the container (this overrides the default set of paths). */
    ReadonlyPaths: string[]
}


export interface ContainerConfig<IsOnLinux extends boolean> {
    /** The hostname to use for the container, as a valid RFC 1123 hostname. */
    Hostname: string,
    /** 
    The domain name to use for the container. */
    Domainname: string,
    /** 
     * Commands run as this user inside the container. If omitted, commands run as the user specified in the image the container was started from.
     *
     * Can be either user-name or UID, and optional group-name or GID, separated by a colon (<user-name|UID>[<:group-name|GID>]). 
     */
    User: string,
    /** Whether to attach to `stdin`. */
    AttachStdin: boolean,
    /** Whether to attach to `stdout`. */
    AttachStdout: boolean,
    /** Whether to attach to `stderr`. */
    AttachStderr: boolean,
    /** An object mapping ports to an empty object */
    ExposedPorts: ExposedPorts,
    /** Attach standard streams to a TTY, including `stdin` if it is not closed. */
    Tty: boolean,
    /** Open `stdin` */
    OpenStdin: boolean,
    /** Close `stdin` after one attached client disconnects. */
    StdinOnce: boolean,
    /** A list of environment variables to set inside the container. */
    Env: Env[],
    /** Command to run specified as a string or an array of strings. */
    Cmd: string[],
    /** A test to perform to check that the container is healthy. */
    Healthcheck: {
        /** The test to perform. Possible values are:
         *
         * + `[]` inherit healthcheck from image or parent image
         * + `["NONE"]` disable healthcheck
         * + `["CMD", args...]` exec arguments directly
         * + `["CMD-SHELL", command]` run command with system's default shell 
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
    },
    /** Command is already escaped (Windows only) */
    ArgsEscaped: If<IsOnLinux, undefined, boolean | null>,
    /** The name (or reference) of the image to use when creating the container, or which was used when the container was created. */
    Image: string,
    /** An object mapping mount point paths inside the container to empty objects. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Volumes: Record<string, {}>,
    /**The working directory for commands to run in. */
    WorkingDir: string,
    /** 
     * The entry point for the container as a string or an array of strings.
     *
     * If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`). 
    */
    Entrypoint: string[],
    /** Disable networking for the container. */
    NetworkDisabled: boolean | null,
    /** 
     * MAC address of the container.
     * 
     * @deprecated Use EndpointSettings.MacAddress instead.
     */
    MacAddress: string | null,
    /** `ONBUILD` metadata that were defined in the image's `Dockerfile`. */
    OnBuild: string[] | null,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** Signal to stop a container as a string or unsigned integer. */
    StopSignal: string | null,
    /** Timeout to stop a container in seconds. */
    StopTimeout: number | null,
    /** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell. */
    Shell: string[] | null
}

export interface SecondaryIPAddress {
    /** IP address. */
    Addr: string,
    /** Mask length of the IP address. */
    PrefixLen: number
}

export interface ContainerNetworkSettings {
    /** Name of the default bridge interface when dockerd's --bridge flag is set. */
    Bridge: string,
    /** SandboxID uniquely represents a container's network stack. */
    SandboxID: string,
    /**
     * Indicates if hairpin NAT should be enabled on the virtual interface.
     * 
     * @deprecated This field is never set and will be removed in a future release.
     */
    HairpinMode: undefined,
    /** 
     * IPv6 unicast address using the link-local prefix.
     *
     * @deprecated This field is never set and will be removed in a future release.
     */
    LinkLocalIPv6Address: undefined,
    /** 
     * Prefix length of the IPv6 unicast address.
     * 
     * @deprecated This field is never set and will be removed in a future release.
     */
    LinkLocalIPv6PrefixLen: undefined,
    /** 
     * PortMap describes the mapping of container ports to host ports, using the container's port-number and protocol as key in the format `<port>/<protocol>`, for example, `80/udp`.
     * 
     * If a container's port is mapped for multiple protocols, separate entries are added to the mapping table. 
     */
    Ports: {
        [name: string]: {
            /** Host IP address that the container's port is mapped to. */
            HostIp: string,
            /** Host port number that the container's port is mapped to. */
            HostPort: string
        }[] | null
    },
    /** SandboxKey is the full path of the netns handle. */
    SandboxKey: string,
    /** 
     * @deprecated This field is never set and will be removed in a future release.
     */
    SecondaryIPAddresses: undefined /* SecondaryIPAddress[] */,
    /**  
     * @deprecated This field is never set and will be removed in a future release.
     */
    SecondaryIPv6Addresses: undefined /* SecondaryIPAddress[] */,
    /** 
     * EndpointID uniquely represents a service endpoint in a Sandbox. 
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the `Networks` map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0
     */
    EndpointID: string,
    /** 
     * Gateway address for the default "bridge" network.
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0 
     */
    Gateway: string,
    /** 
     * Global IPv6 address for the default "bridge" network.
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0 
     */
    GlobalIPv6Address: string,
    /** 
     * Mask length of the global IPv6 address.
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0 
     */
    GlobalIPv6PrefixLen: string,
    /** 
     * IPv4 address for the default "bridge" network.
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0
     */
    IPAddress: string,
    /** 
     * Mask length of the IPv4 address. 
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0
     */
    IPPrefixLen: string,
    /** 
     * IPv6 gateway address for this network. 
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0
     */
    IPv6Gateway: string,
    /** MAC address for the container on the default "bridge" network. 
     * 
     * @deprecated This field is only propagated when attached to the default "bridge" network. Use the information from the "bridge" network inside the Networks map instead, which contains the same information. This field was deprecated in Docker 1.9 and is scheduled to be removed in Docker 17.12.0
     */
    MacAddress: string,
    /** Information about all networks that the container is connected to. */
    Network: ContainerNetwork
}

export interface InspectContainer<IsOnLinux extends boolean> {
    /** The ID of this container as a 128-bit (64-character) hexadecimal string (32 bytes). */
    Id: string,
    /** 
     * Date and time at which the container was created, formatted in RFC 3339 format with nano-seconds.
     * 
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    Created: string | null,
    /** The path to the command being run. */
    Path: string,
    /** The arguments to the command being run */
    Args: string[],
    /** ContainerState stores container's running state. It's part of ContainerJSONBase and will be returned by the "inspect" command. */
    State: ContainerState | null,
    /** The ID (digest) of the image that this container was created from. */
    Image: string,
    /** 
     * Location of the /etc/resolv.conf generated for the container on the host.
     * 
     * This file is managed through the docker daemon, and should not be accessed or modified by other tools.
     */
    ResolvConfPath: string,
    /**
     * Location of the /etc/hostname generated for the container on the host.
     *
     * This file is managed through the docker daemon, and should not be accessed or modified by other tools.
     */
    HostnamePath: string,
    /**
     * Location of the /etc/hosts generated for the container on the host.
     *
     * This file is managed through the docker daemon, and should not be accessed or modified by other tools.
     */
    HostsPath: string,
    /**
     * Location of the file used to buffer the container's logs. Depending on the logging-driver used for the container, this field may be omitted.
     *
     * This file is managed through the docker daemon, and should not be accessed or modified by other tools.
     */
    LogPath: string | null,
    /**
     * The name associated with this container.
     *
     * For historic reasons, the name may be prefixed with a forward-slash (`/`).
     */
    Name: string,
    /** Number of times the container was restarted since it was created, or since daemon was started. */
    RestartCount: string,
    /** The storage-driver used for the container's filesystem (graph-driver or snapshotter). */
    Driver: string,
    /** 
     * The platform (operating system) for which the container was created.
     * 
     * This field was introduced for the experimental "LCOW" (Linux Containers On Windows) features, which has been removed. In most cases, this field is equal to the host's operating system (`linux` or `windows`).
     */
    Platform: string,
    /** 
     * A descriptor struct containing digest, media type, and size, as defined in the OCI Content Descriptors Specification.
     *
     * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/descriptor.md
     */
    ImageManifestDescriptor: ImageManifestDescriptor,
    /** SELinux mount label set for the container. */
    MountLabel: string,
    /** SELinux process label set for the container. */
    ProcessLabel: string,
    /** The AppArmor profile set for the container. */
    AppArmorProfile: string,
    /** IDs of exec instances that are running in the container. */
    ExecIDs: string[] | null,
    /** Container configuration that depends on the host we are running on */
    HostConfig: ContainerHostConfig<IsOnLinux>,
    /** Information about the storage driver used to store the container's and image's filesystem. */
    GraphDriver: GraphDriver,
    /** 
     * The size of files that have been created or changed by this container.
     *
     * This field is omitted by default, and only set when size is requested in the API request.
     */
    SizeRw: number | null,
    /** 
     * The total size of all files in the read-only layers from the image that the container uses. These layers can be shared between containers.
     * 
     * This field is omitted by default, and only set when size is requested in the API request.
     */
    SizeRootFs: number | null,
    /** List of mounts used by the container. */
    Mounts: ContainerMount<IsOnLinux>[],
    /** Configuration for a container that is portable between hosts. */
    Config: ContainerConfig<IsOnLinux>,
    /** NetworkSettings exposes the network settings in the API. */
    NetworkSettings: ContainerNetworkSettings,
}

/*
 * Container process
 */
export interface Process {
    /** The ps column titles */
    Titles: string[],
    /** Each process running in the container, where each process is an array of values corresponding to the titles. */
    Processes: string[],
}

/*
 * Container filesystem change
 */
export interface FilesystemChange {
    /** Path to file or directory that has changed. */
    Path: string,
    /** 
     * Kind of change
     * + `0` Modified ("C")
     * + `1` Added ("A")
     * + `2` Deleted ("D")
     */
    Kind: 0 | 1 | 2
}

/*
 * Container usage
 */
export interface BlkioStat {
    major: number,
    minor: number,
    op: number,
    value: number
}

export type BlkioStatMaybeOmmited = (BlkioStat | null)[] | null | undefined

export interface CpuStats<IsOnLinux extends boolean> {
    /** All CPU stats aggregated since container inception. */
    cpu_usage: {
        /** Total CPU time consumed in nanoseconds (Linux) or 100's of nanoseconds (Windows). */
        total_usage: number,
        /** 
         * Total CPU time (in nanoseconds) consumed per core (Linux).
         *
         * This field is Linux-specific when using cgroups v1. It is omitted when using cgroups v2 and Windows containers.
         */
        percpu_usage: IfOmitted<IsOnLinux, number[] | null>,
        /** 
         * Time (in nanoseconds) spent by tasks of the cgroup in kernel mode (Linux), or time spent (in 100's of nanoseconds) by all container processes in kernel mode (Windows).
         *
         * Not populated for Windows containers using Hyper-V isolation. 
         */
        usage_in_kernelmode: number | undefined,
        /** 
         * Time (in nanoseconds) spent by tasks of the cgroup in user mode (Linux), or time spent (in 100's of nanoseconds) by all container processes in kernel mode (Windows).
         *
         * Not populated for Windows containers using Hyper-V isolation.
         */
        usage_in_usermode: number | undefined,
    } | null,
    /** 
     * System Usage.
     *
     * This field is Linux-specific and omitted for Windows containers.
     */
    system_cpu_usage: IfOmitted<IsOnLinux, number | null>,
    /** 
     * Number of online CPUs.
     *
     * This field is Linux-specific and omitted for Windows containers.
     */
    online_cpus: IfOmitted<IsOnLinux, number | null>,
    /** 
     * CPU throttling stats of the container.
     *
     * This type is Linux-specific and omitted for Windows containers.
     */
    throttling_data: IfOmitted<IsOnLinux, {
        /** Number of periods with throttling active. */
        periods: number,
        /** Number of periods when the container hit its throttling limit. */
        throttled_periods: number,
        /** Aggregated time (in nanoseconds) the container was throttled for. */
        throttled_time: number
    } | null>,
}

export interface ContainerUsage<IsOnLinux extends boolean> {
    /** Name of the container. */
    name: string,
    /** ID of the container. */
    id: string,
    /** Date and time at which this sample was collected. The value is formatted as RFC 3339 with nano-seconds. */
    read: string,
    /** 
     * Date and time at which this first sample was collected. This field is not propagated if the "one-shot" option is set. If the "one-shot" option is set, this field may be omitted, empty, or set to a default date (0001-01-01T00:00:00Z).
     *
     * The value is formatted as RFC 3339 with nano-seconds.
     * 
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    preread: string,
    /** 
     * PidsStats contains Linux-specific stats of a container's process-IDs (PIDs).
     *
     * This type is Linux-specific and omitted for Windows containers.
     */
    pids_stats: IfOmitted<IsOnLinux, {
        /** Current is the number of PIDs in the cgroup. */
        current: number | null,
        /** Limit is the hard limit on the number of pids in the cgroup. A "Limit" of 0 means that there is no limit. */
        limit: number | null,
    }>,
    /** 
     * BlkioStats stores all IO service stats for data read and write.
     * 
     * This type is Linux-specific and holds many fields that are specific to cgroups v1. On a cgroup v2 host, all fields other than io_service_bytes_recursive are omitted or null.
     *
     * This type is only populated on Linux and omitted for Windows containers. 
     */
    blkio_stats: {
        /** Array of objects or null (ContainerBlkioStatEntry) */
        io_service_bytes_recursive: BlkioStat[] | null,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        io_serviced_recursive: BlkioStatMaybeOmmited,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        io_queue_recursive: BlkioStatMaybeOmmited,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        io_service_time_recursive: BlkioStatMaybeOmmited,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        io_wait_time_recursive: BlkioStatMaybeOmmited,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        io_merged_recursive: BlkioStatMaybeOmmited,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        io_time_recursive: BlkioStatMaybeOmmited,
        /** This field is only available when using Linux containers with cgroups v1. It is omitted or null when using cgroups v2. */
        sectors_recursive: BlkioStatMaybeOmmited
    } | null,
    /** 
     * The number of processors on the system.
     *
     * This field is Windows-specific and always zero for Linux containers.
     */
    num_procs: If<IsOnLinux, 0, number>,
    /** 
     * StorageStats is the disk I/O stats for read/write on Windows.
     *
     * This type is Windows-specific and omitted for Linux containers.
     */
    storage_stats: If<IsOnLinux, undefined, {
        read_count_normalized: number | null,
        read_size_bytes: number | null,
        write_count_normalized: number | null,
        write_size_bytes: number | null,
    } | null>,
    /** CPU related info of the container */
    cpu_stats: CpuStats<IsOnLinux> | null,
    /** CPU related info of the container */
    precpu_stats: CpuStats<IsOnLinux> | null,
    /** Aggregates all memory stats since container inception on Linux. Windows returns stats for commit and private working set only. */
    memory_stats: {
        /** 
         * Current res_counter usage for memory.
         *
         * This field is Linux-specific and omitted for Windows containers.
         */
        usage: IfOmitted<IsOnLinux, number | null>,
        /** 
         * Maximum usage ever recorded.
         *
         * This field is Linux-specific and only supported on cgroups v1. It is omitted when using cgroups v2 and for Windows containers.
         */
        max_usage: IfOmitted<IsOnLinux, number | null>,
        /**
         * All the stats exported via memory.stat. when using cgroups v2.
         *
         * This field is Linux-specific and omitted for Windows containers.
         */
        stats: IfOmitted<IsOnLinux, Record<string, number | null>>,
        /** 
         * Number of times memory usage hits limits.
         *
         * This field is Linux-specific and only supported on cgroups v1. It is omitted when using cgroups v2 and for Windows containers. 
         */
        failcnt: IfOmitted<IsOnLinux, number | null>,
        /** This field is Linux-specific and omitted for Windows containers. */
        limit: IfOmitted<IsOnLinux, number | null>,
        /** This field is Windows-specific and omitted for Linux containers. */
        commitbytes: If<IsOnLinux, undefined, number | null>,
        /** 
         * Peak committed bytes.
         * 
         * This field is Windows-specific and omitted for Linux containers.
         */
        commitpeakbytes: If<IsOnLinux, undefined, number | null>,
        /** 
         * Private working set.
         *
         * This field is Windows-specific and omitted for Linux containers.
         */
        privateworkingset: If<IsOnLinux, undefined, number | null>
    },
    /** 
     * Network statistics for the container per interface.
     * 
     * This field is omitted if the container has no networking enabled.
     */
    networks: {
        [name: string]: {
            /** Bytes received. Windows and Linux. */
            rx_bytes: number,
            /** Packets received. Windows and Linux. */
            rx_packets: number,
            /** 
             * Received errors. Not used on Windows.
             *
             * This field is Linux-specific and always zero for Windows containers.
             */
            rx_errors: IfOmitted<IsOnLinux, number>,
            /** Incoming packets dropped. Windows and Linux. */
            rx_dropped: number,
            /** Bytes sent. Windows and Linux. */
            tx_bytes: number,
            /** Packets sent. Windows and Linux. */
            tx_packets: number,
            /** 
             * Sent errors. Not used on Windows.
             *
             * This field is Linux-specific and always zero for Windows containers.
             */
            tx_errors: IfOmitted<IsOnLinux, number>,
            /** Outgoing packets dropped. Windows and Linux. */
            tx_dropped: number,
            /** 
             * Endpoint ID. Not used on Linux.
             *
             * This field is Windows-specific and omitted for Linux containers
             */
            endpoint_id: IfOmitted<IsOnLinux, string | null>,
            /** 
             * Instance ID. Not used on Linux.
             *
             * This field is Windows-specific and omitted for Linux containers.
             */
            instance_id: IfOmitted<IsOnLinux, string | null>
        } | null
    } | null
}

/*
 * Update container
 */
export interface UpdateOption<IsOnLinux extends boolean> {
    /** An integer value representing this container's relative CPU weight versus other containers. */
    CpuShares?: number,
    /** Memory limit in bytes. */
    Memory?: number,
    /** Path to `cgroups` under which the container's `cgroup` is created. If the path is not absolute, the path is considered to be relative to the `cgroups` path of the init process. Cgroups are created if they do not already exist. */
    CgroupParent?: string,
    /** Block IO weight (relative weight). */
    BlkioWeight?: number,
    /** Block IO weight (relative device weight). */
    BlkioWeightDevice?: {
        Path: string,
        Weight: number
    }[],
    /** Limit read rate (bytes per second) from a device. */
    BlkioDeviceReadBps?: ContainerBlkioDevice[],
    /** Limit write rate (bytes per second) to a device. */
    BlkioDeviceWriteBps?: ContainerBlkioDevice[],
    /** Limit read rate (IO per second) from a device. */
    BlkioDeviceReadIOps?: ContainerBlkioDevice[],
    /** Limit write rate (IO per second) to a device. */
    BlkioDeviceWriteIOps?: ContainerBlkioDevice[],
    /** The length of a CPU period in microseconds. */
    CpuPeriod?: number,
    /** Microseconds of CPU time that the container can get in a CPU period. */
    CpuQuota?: number,
    /** The length of a CPU real-time period in microseconds. Set to 0 to allocate no time allocated to real-time tasks. */
    CpuRealtimePeriod?: number,
    /** The length of a CPU real-time runtime in microseconds. Set to 0 to allocate no time allocated to real-time tasks. */
    CpuRealtimeRuntime?: number,
    /** CPUs in which to allow execution (e.g., `0-3`, `0,1`). */
    CpusetCpus?: string,
    /** Memory nodes (MEMs) in which to allow execution (0-3, 0,1). Only effective on NUMA systems. */
    CpusetMems?: string,
    /** A list of devices to add to the container. */
    Devices?: ContainerDevice[],
    /** A list of cgroup rules to apply to the container. */
    DeviceCgroupRules?: string[],
    /** A list of requests for devices to be sent to device drivers. */
    DeviceRequests?: ContainerDeviceRequest[],
    /**
     * Hard limit for kernel TCP buffer memory (in bytes). Depending on the OCI runtime in use, this option may be ignored. It is no longer supported by the default (runc) runtime.
     *
     * This field is omitted when empty. 
     * */
    KernelMemoryTCP?: number | undefined,
    /** Memory soft limit in bytes. */
    MemoryReservation?: number,
    /** Total memory limit (memory + swap). Set as `-1` to enable unlimited swap. */
    MemorySwap?: number,
    /** Tune a container's memory swappiness behavior. Accepts an integer between 0 and 100. */
    MemorySwappiness?: number,
    /** CPU quota in units of 10^-9 CPUs. */
    NanoCpus?: number,
    /** Disable OOM Killer for the container. */
    OomKillDisable?: boolean,
    /** Run an init inside the container that forwards signals and reaps processes. This field is omitted if empty, and the default (as configured on the daemon) is used. */
    Init?: boolean | null,
    /** Tune a container's PIDs limit. Set `0` or `-1` for unlimited, or `null` to not change. */
    PidsLimit?: number | null,
    /** A list of resource limits to set in the container. */
    Ulimits?: Ulimit[],
    /** 
     * The number of usable CPUs (Windows only).
     * 
     * On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is CPUCount first, then CPUShares, and CPUPercent last.
     */
    CpuCount?: If<IsOnLinux, undefined, number>,
    /** 
     * The usable percentage of the available CPUs (Windows only).
     * 
     * On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is CPUCount first, then CPUShares, and CPUPercent last.
     */
    CpuPercent?: If<IsOnLinux, undefined, number>,
    /** Maximum IOps for the container system drive (Windows only) */
    IOMaximumIOps?: If<IsOnLinux, undefined, number>,
    /** Maximum IO in bytes per second for the container system drive (Windows only). */
    IOMaximumBandwidth?: If<IsOnLinux, undefined, number>,
    /** 
     * The behavior to apply when the container exits. The default is not to restart.
     *
     * An ever increasing delay (double the previous delay, starting at 100ms) is added before each restart to prevent flooding the server.
     */
    RestartPolicy?: ContainerRestartPolicy,
}

export interface UpdateResponse {
    Warnings: string
}

/*
 * Wait container
 */
export interface Wait {
    StatusCode: number,
    Error: {
        Message: string
    } | null
}

/*
 * Prune container
 */
export interface PruneFilter {
    until: string,
    label: string[]
}

export interface Prune {
    ContainersDeleted: string[],
    SpaceReclaimed: number
}
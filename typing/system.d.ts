import type { GenericResource, StringObject } from "./global";
import type { ContainerSummary } from "./container";
import type { ImageSummary } from "./image";
import type { SwarmSpec } from "./swarm";
import type { VolumeObject } from "./volume";

export interface Commit {
    /** Actual commit ID of external tool */
    ID: string
}

/*
 * Auth
 */
export interface AuthOption {
    username: string,
    password: string,
    email: string,
    serveraddress: string
}

export interface AuthResponse {
    /** The status of the authentication */
    Status: string,
    /** An opaque token used to authenticate a user after a successful login */
    IdentityToken: string
}

/*
 * Version
 */
export interface SystemVersion {
    Platform: {
        Name: string,
    },
    /** Information about system components */
    Components: {
        /** Name of the component */
        Name: string,
        /** Version of the component */
        Version: string,
        /** 
         * Key/value pairs of strings with additional information about the component. These values are intended for informational purposes only, and their content is not defined, and not part of the API specification.
         * 
         * These messages can be printed by the client as information to the user.
         */
        Details: object | null
    },
    /** The version of the daemon */
    Version: string,
    /** The default (and highest) API version that is supported by the daemon */
    ApiVersopn: string,
    /** The minimum API version that is supported by the daemon */ 
    MinAPIVersion: string,
    /** The Git commit of the source code that was used to build the daemon */
    GitCommit: string,
    /** The version Go used to compile the daemon, and the version of the Go runtime in use. */
    GoVersion: string,
    /** The operating system that the daemon is running on ("linux" or "windows") */
    Os: string,
    /** The architecture that the daemon is running on */
    Arch: string,
    /** 
     * The kernel version (`uname -r`) that the daemon is running on.
     * 
     * This field is omitted when empty.
     */
    KernelVersion: string,
    /** 
     * Indicates if the daemon is started with experimental features enabled.
     * 
     * This field is omitted when empty / false.
     */
    Experimental: boolean,
    /** The date and time that the daemon was compiled. */
    BuildTime: string
}

/*
 * Info
 */
export interface SystemInfo {
    /** 
     * Unique identifier of the daemon.
     * 
     * Note: The format of the ID itself is not part of the API, and should not be considered stable.
     */
    ID: string,
    /** Total number of containers on the host. */
    Containers: number,
    /** Number of containers with status `"running"`. */
    ContainersRunning: number,
    /** Number of containers with status `"paused"`. */
    ContainersPaused: number,
    /** Number of containers with status `"stopped"`. */
    ContainersStopped: string,
    /** 
     * Total number of images on the host.
     * 
     * Both tagged and untagged (dangling) images are counted.
     */
    Images: number,
    /** Name of the storage driver in use. */
    Driver: string,
    /** 
     * Information specific to the storage driver, provided as "label" / "value" pairs.
     * 
     * This information is provided by the storage driver, and formatted in a way consistent with the output of docker info on the command line.
     * 
     * Note: The information returned in this field, including the formatting of values and labels, should not be considered stable, and may change without notice.
     */
    DriverStatus: string[][],
    /** 
     * Root directory of persistent Docker state.
     * 
     * Defaults to /var/lib/docker on Linux, and C:\ProgramData\docker on Windows.
     */
    DockerRootDir: string,
    /** 
     * Available plugins per type.
     * 
     * Only unmanaged (V1) plugins are included in this list. V1 plugins are "lazily" loaded, and are not returned in this list if there is no resource using the plugin.
     */
    Plugins: {
        /** Names of available volume-drivers, and network-driver plugins. */
        Volume: string[],
        /** Names of available network-drivers, and network-driver plugins. */
        Network: string[],
        /** Names of available authorization plugins. */
        Authorization: string[],
        /** Names of available logging-drivers, and logging-driver plugins. */
        Log: string[]
    },
    /** Indicates if the host has memory limit support enabled. */
    MemoryLimit: boolean,
    /** Indicates if the host has memory swap limit support enabled. */
    SwapLimit: boolean,
    /** 
     * Indicates if the host has kernel memory TCP limit support enabled. This field is omitted if not supported.
     * 
     * Kernel memory TCP limits are not supported when using cgroups v2, which does not support the corresponding memory.kmem.tcp.limit_in_bytes cgroup.
     */
    LernalMemoryTCP: boolean,
    /** Indicates if CPU CFS(Completely Fair Scheduler) period is supported by the host. */
    CpuCfsPeriod: boolean,
    /** Indicates if CPU CFS(Completely Fair Scheduler) quota is supported by the host. */
    CpuCfsQuota: boolean,
    /** Indicates if CPU Shares limiting is supported by the host. */
    CPUShares: boolean,
    /** 
     * Indicates if CPUsets (cpuset.cpus, cpuset.mems) are supported by the host.
     * @see https://www.kernel.org/doc/Documentation/cgroup-v1/cpusets.txt
     */
    CPUSet: boolean,
    /** Indicates if the host kernel has PID limit support enabled. */
    PidsLimit: boolean,
    /** Indicates if OOM killer disable is supported on the host. */
    OomKillDisable: boolean,
    /** Indicates IPv4 forwarding is enabled. */
    IPv4Forwarding: boolean,
    /** Indicates if the daemon is running in debug-mode / with debug-level logging enabled. */
    Debug: boolean,
    /** 
     * The total number of file Descriptors in use by the daemon process.
     * 
     * This information is only returned if debug-mode is enabled.
     */
    NFd: number,
    /** 
     * The number of goroutines that currently exist.
     * 
     * This information is only returned if debug-mode is enabled.
     */
    NGoroutines: number,
    /** 
     * Current system-time in RFC 3339 format with nano-seconds.
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    SystemTime: string,
    /** The logging driver to use as a default for new containers. */
    LoggingDriver: string,
    /** The driver to use for managing cgroups. */
    CgroupDiver: "cgroupfs" | "systemd" | "none",
    /** The version of the cgroup. */
    CgroupVersion: "1" | "2",
    /** Number of event listeners subscribed. */
    NEventsListener: number,
    /** 
     * Kernel version of the host.
     * 
     * On Linux, this information obtained from `uname`. 
     * On Windows this information is queried from the `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\` registry value, for example `"10.0 14393 (14393.1198.amd64fre.rs1_release_sec.170427-1353)"`.
     */
    KernelVersion: string,
    /** Name of the host's operating system, for example: `Ubuntu 24.04 LTS` or `Windows Server 2016 Datacenter` */
    OperatingSystem: string,
    /** 
     * Version of the host's operating system
     * 
     * Note: The information returned in this field, including its very existence, and the formatting of values, should not be considered stable, and may change without notice.
     */
    OSVersion?: string,
    /** 
     * Generic type of the operating system of the host, as returned by the Go runtime (`GOOS`).
     * 
     * Currently returned values are "linux" and "windows". A full list of possible values can be found in the Go documentation.
     * 
     * @see https://go.dev/doc/install/source#environment
     */
    OSType: string,
    /** 
     * Hardware architecture of the host, as returned by the Go runtime (`GOARCH`).
     * 
     * A full list of possible values can be found in the Go documentation.
     * 
     * @see https://go.dev/doc/install/source#environment
     */
    Architecture: string,
    /** 
     * The number of logical CPUs usable by the daemon.
     * 
     * The number of available CPUs is checked by querying the operating system when the daemon starts. Changes to operating system CPU allocation after the daemon is started are not reflected.
     */
    NCPU: number,
    /** Total amount of physical memory available on the host, in bytes. */
    MemTotal: number,
    /** Address / URL of the index server that is used for image search, and as a default for user authentication for Docker Hub and Docker Cloud. */
    IndexServerAddress: string,
    /** RegistryServiceConfig stores daemon registry services configuration. */
    RegistryConfig: {
        /** 
         * List of IP ranges of insecure registries, using the CIDR syntax (RFC 4632). Insecure registries accept un-encrypted (HTTP) and/or untrusted (HTTPS with certificates from unknown CAs) communication.
         * 
         * By default, local registries (`::1/128` and `127.0.0.0/8`) are configured as insecure. All other registries are secure. Communicating with an insecure registry is not possible if the daemon assumes that registry is secure.
         * 
         * This configuration override this behavior, insecure communication with registries whose resolved IP address is within the subnet described by the CIDR syntax.
         * 
         * Registries can also be marked insecure by hostname. Those registries are listed under `IndexConfigs` and have their `Secure` field set to `false`.
         * 
         * Warning: Using this option can be useful when running a local registry, but introduces security vulnerabilities. This option should therefore ONLY be used for testing purposes. For increased security, users should add their CA to their system's list of trusted CAs instead of enabling this option.
         * 
         * @see https://tools.ietf.org/html/4632
         */
        InsecureRegistryCIDRs: string[],
        IndexConfigs: {
            /** IndexInfo contains information about a registry. */
            [key: string]: {
                /** Name of the registry, such as `docker.io`. */
                Name: string,
                /** List of mirrors, expressed as URIs. */
                Mirrors: string[],
                /** 
                 * Indicates if the registry is part of the list of insecure registries.
                 * 
                 * If `false`, the registry is insecure. Insecure registries accept un-encrypted (HTTP) and/or untrusted (HTTPS with certificates from unknown CAs) communication.
                 * 
                 * Warning: Insecure registries can be useful when running a local registry. However, because its use creates security vulnerabilities it should ONLY be enabled for testing purposes. For increased security, users should add their CA to their system's list of trusted CAs instead of enabling this option.
                 */
                Secure: boolean,
                /** Indicates whether this is an official registry (i.e., Docker Hub / docker.io) */
                Official: boolean,
            }
        },
        /** List of registry URLs that act as a mirror for the official (`docker.io`) registry. */
        Mirrors: string[]
    } | null,
    /** User-defined resources can be either Integer resources (e.g, `SSD=3`) or String resources (e.g, `GPU=UUID1`). */
    GenericResources: GenericResource,
    /** 
     * HTTP-proxy configured for the daemon. This value is obtained from the `HTTP_PROXY` environment variable. Credentials (user info component) in the proxy URL are masked in the API response.
     * 
     * Containers do not automatically inherit this configuration.
     * 
     * @see https://tools.ietf.org/html/rfc3986#section-3.2.1
     */
    HttpProxy: string,
    /** 
     * HTTPS-proxy configured for the daemon. This value is obtained from the `HTTPS_PROXY` environment variable. Credentials (user info component) in the proxy URL are masked in the API response.
     * 
     * Containers do not automatically inherit this configuration.
     * 
     * @see https://tools.ietf.org/html/rfc3986#section-3.2.1
     */
    HttpsProxy: string,
    /** 
     * Comma-separated list of domain extensions for which no proxy should be used. This value is obtained from the `NO_PROXY` environment variable.
     * 
     * Containers do not automatically inherit this configuration.
     */
    NoProxy: string,
    /** Hostname of the host. */
    Name: string,
    /** 
     * User-defined labels (key/value metadata) as set on the daemon.
     * 
     * Note: When part of a Swarm, nodes can both have daemon labels, set through the daemon configuration, and node labels, set from a manager node in the Swarm. Node labels are not included in this field. Node labels can be retrieved using the /nodes/(id) endpoint on a manager node in the Swarm.
     */
    Labels: string[],
    /** Indicates if experimental features are enabled on the daemon. */
    ExperimentalBuild: boolean,
    /** Version string of the daemon. */
    ServerVersion: string,
    /** 
     * List of OCI compliant runtimes configured on the daemon. Keys hold the "name" used to reference the runtime.
     * 
     * The Docker daemon relies on an OCI compliant runtime (invoked via the containerd daemon) as its interface to the Linux kernel namespaces, cgroups, and SELinux.
     * 
     * The default runtime is runc, and automatically configured. Additional runtimes can be configured by the user and will be listed here.
     * 
     * @see https://github.com/opencontainers/runtime-spec
     */
    Runtimes: {
        /** 
         * Runtime describes an OCI compliant runtime.
         * 
         * The runtime is invoked by the daemon via the containerd daemon. OCI runtimes act as an interface to the Linux kernel namespaces, cgroups, and SELinux.
         * 
         * @see https://github.com/opencontainers/runtime-spec
         */
        [key: string]: {
            /** 
             * Name and, optional, path, of the OCI executable binary.
             * 
             * If the path is omitted, the daemon searches the host's `$PATH` for the binary and uses the first result.
             */
            path: string,
            /** List of command-line arguments to pass to the runtime when invoked. */
            runtimeArgs: string[] | null,
            /** 
             * Information specific to the runtime.
             * 
             * While this API specification does not define data provided by runtimes, the following well-known properties may be provided by runtimes:
             * 
             * `org.opencontainers.runtime-spec.features`: features structure as defined in the OCI Runtime Specification, in a JSON string representation.
             * 
             * Note: The information returned in this field, including the formatting of values and labels, should not be considered stable, and may change without notice.
             * 
             * @see https://github.com/opencontainers/runtime-spec/blob/main/features.md
             */
            status: StringObject | null
        }
    },
    /** 
     * Name of the default OCI runtime that is used when starting containers.
     * 
     * The default can be overridden per-container at create time.
     */
    DefaultRuntime: string,
    /** Represents generic information about swarm. */
    Swarm: {
        /** Unique identifier of for this node in the swarm. */
        NodeID: string,
        /** IP address at which this node can be reached by other nodes in the swarm. */
        NodeAddr: string,
        /** Current local status of this node. */
        LocalNodeState: "" | "inactive" | "pending" | "active" | "error" | "locked",
        ControlAvailable: boolean,
        Error: string,
        /** List of ID's and addresses of other managers in the swarm. */
        RemoteManager: {
            /** Unique identifier of for this node in the swarm. */
            NodeID: string,
            /** IP address and ports at which this node can be reached */
            Addr: string,
        }[] | null,
        /** Total number of nodes in the swarm. */
        Nodes: number | null,
        /** Total number of managers in the swarm. */
        Managers: number | null,
        /** ClusterInfo represents information about the swarm as is returned by the "/info" endpoint. Join-tokens are not included. */
        Cluster: {
            /** The ID of the swarm. */
            ID: string,
            /** 
             * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
             * 
             * This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
             */
            Version: {
                /**  */
                Index: number
            },
            /** 
             * Date and time at which the swarm was initialised in RFC 3339 format with nano-seconds.
             * @see https://www.ietf.org/rfc/rfc3339.txt
             */
            CreatedAt: string,
            /** 
             * Date and time at which the swarm was last updated in RFC 3339 format with nano-seconds.
             * @see https://www.ietf.org/rfc/rfc3339.txt
             */
            UpdatedAt: string,
            /** User modifiable swarm configuration. */
            Spec: SwarmSpec,
            /** Information about the issuer of leaf TLS certificates and the trusted root CA certificate. */
            TLSInfo: {
                /** The root CA certificate(s) that are used to validate leaf TLS certificates. */
                TrustRoot: string,
                /** The base64-url-safe-encoded raw subject bytes of the issuer. */
                CertIssuerSubject: string,
                /** The base64-url-safe-encoded raw public key bytes of the issuer. */
                CertIssuerPublicKey: string
            },
            /** Whether there is currently a root CA rotation in progress for the swarm */
            RootRotationInProgress: boolean,
            /** DataPathPort specifies the data path port number for data traffic. Acceptable port range is 1024 to 49151. If no port is set or is set to 0, the default port (4789) is used. */
            DataPathPort: number,
            /** Default Address Pool specifies default subnet pools for global scope networks. */
            DefaultAddrPool: string[],
            /** SubnetSize specifies the subnet size of the networks created from the default subnet pool. */
            SubnetSize: number
        } | null
    },
    /** 
     * Indicates if live restore is enabled.
     * 
     * If enabled, containers are kept running when the daemon is shutdown or upon daemon start if running containers are detected.
     */
    LiveRestoreEnabled: boolean,
    /** 
     * Represents the isolation technology to use as a default for containers. The supported values are platform-specific.
     * 
     * If no isolation value is specified on daemon start, on Windows client, the default is `hyperv`, and on Windows server, the default is `process`.
     * 
     * This option is currently not used on other platforms.
     */
    Isolation: "default" | "hyperv" | "process" | "",
    /** 
     * Name and, optional, path of the `docker-init` binary.
     * 
     * If the path is omitted, the daemon searches the host's $PATH for the binary and uses the first result.
     */
    InitBinary: string,
    /** Commit holds the Git-commit (SHA1) that a binary was built from, as reported in the version-string of external tools, such as `containerd`, or `runC`. */
    ContainerdCommit: Commit,
    /** Commit holds the Git-commit (SHA1) that a binary was built from, as reported in the version-string of external tools, such as `containerd`, or `runC`. */
    RuncCommit: Commit,
    /** Commit holds the Git-commit (SHA1) that a binary was built from, as reported in the version-string of external tools, such as `containerd`, or `runC`. */
    InitCommit: Commit,
    /** 
     * List of security features that are enabled on the daemon, such as apparmor, seccomp, SELinux, user-namespaces (userns), rootless and no-new-privileges.
     * 
     * Additional configuration options for each security feature may be present, and are included as a comma-separated list of key/value pairs.
     */
    SecurityOptions: string[],
    /** 
     * Reports a summary of the product license on the daemon.
     * 
     * If a commercial license has been applied to the daemon, information such as number of nodes, and expiration are included.
     */
    ProductLicense: string,
    /** 
     * List of custom default address pools for local networks, which can be specified in the daemon.json file or dockerd option.
     * 
     * Example: a Base `10.10.0.0/16` with Size 24 will define the set of `256 10.10.[0-255].0/24` address pools.
     */
    DefaultAddressPools: {
        /** The network address in CIDR format */
        Base: string,
        /** The network pool size */
        Size: string
    }[],
    /**  */
    FirewallBackend: {
        /**  */
        Driver: string,
        /**  */
        Info: string[][]
    },
    /**  */
    DiscoveredDevices: {
        /**  */
        Source: string,
        /**  */
        ID: string
    }[],
    /**  */
    Warnings: string[],
    /**  */
    CDISpecDirs: string[],
    /**  */
    Containerd: {
        /**  */
        Address: string,
        /**  */
        Namespaces: {
            /**  */
            Containers: string,
            /**  */
            Plugins: string
            /**  */
        }
    } | null
}

/* 
 * Event
 */
export type ContainerEvent = "attach" | "commit" | "copy" | "create" | "destroy" | "detach" | "die" | "exec_create" | "exec_detach" | "exec_start" | "exec_die" | "export" | "health_status" | "kill" | "oom" | "pause" | "rename" | "resize" | "restart" | "start" | "stop" | "top" | "unpause" | "update" | "prune"
export type ImageEvent = "create" | "delete" | "import" | "load" | "pull" | "push" | "save" | "tag" | "untag" | "prune"
export type VolumeEvent = "create" | "mount" | "unmount" | "destroy" | "prune"
export type NetworkEvent = "create" | "connect" | "disconnect" | "destroy" | "update" | "remove" | "prune"
export type DaemonEvent = "reload"
/** Service, Nodes, Secret, Config Events */
export type SNSCEvent = "create" | "update" | "remove"
export type BuilderEvent = "prune"

export interface MonitorFilter {
    /** config name or ID */
    config?: string,
    /** container name or ID */
    container?: string,
    /** daemon name or ID */
    daemon?: string,
    /** event name or ID */
    event?: string,
    /** image name or ID */
    image?: string,
    /** label name or ID */
    label?: string,
    /** network name or ID */
    network?: string,
    /** node name or ID */
    node?: string,
    /** plugin name or ID */
    plugin?: string,
    /** scope name or ID */
    scope?: string,
    /** secret name or ID */
    secret?: string,
    /** service name or ID */
    service?: string,
    /** volume name or ID */
    volume?: string,
    /** object to filter by */
    type: "container" | "image" | "volume" | "network" | "daemon" | "plugin" | "node" | "service" | "secret" | "config",
}

export interface MonitorOption {
    since?: string,
    until?: string,
    filter?: MonitorFilter
}

export type MonitorEvent = ({
    /** The type of object emitting the event */
    Type: "container",
    /** The type of event */
    Action: ContainerEvent
} | {
    /** The type of object emitting the event */
    Type: "image",
    /** The type of event */
    Action: ImageEvent
} | {
    /** The type of object emitting the event */
    Type: "volume",
    /** The type of event */
    Action: VolumeEvent
} | {
    /** The type of object emitting the event */
    Type: "network",
    /** The type of event */
    Action: NetworkEvent
} | {
    /** The type of object emitting the event */
    Type: "daemon",
    /** The type of event */
    Action: DaemonEvent
} | {
    /** The type of object emitting the event */
    Type: "plugin",
    /** The type of event */
    Action: ""
} | {
    /** The type of object emitting the event */
    Type: "node" | "service" | "secret" | "config",
    /** The type of event */
    Action: SNSCEvent
} | {
    /** The type of object emitting the event */
    Type: string,
    /** The type of event */
    Action: string
}) & {
    /** Actor describes something that generates events, like a container, network, or a volume. */
    Actor: {
        /** The ID of the object emitting the event */
        ID: string,
        /** Various key/value attributes of the object, depending on its type. */
        Attributes: StringObject
    },
    /** Scope of the event. Engine events are `local` scope. Cluster (Swarm) events are `swarm` scope. */
    scope: "local" | "swarm",
    /** Timestamp of event */
    time: number,
    /** Timestamp of event, with nanosecond accuracy */
    timeNano: number
}

/*
 * Usage 
 */
export type UsageObjectType = "container" | "image" | "volume" | "build-cache"

export interface UsageResponse {
    LayersSize: number,
    Images: ImageSummary[],
    Containers: ContainerSummary[],
    Volumes: VolumeObject[],
    BuildCache: {
        /** Unique ID of the build cache record. */
        ID: string,
        /**
         * ID of the parent build cache record.
         * @deprecated
         */
        Parent?: string | null,
        /** List of parent build cache record IDs. */
        Parents: string[] | null,
        /** Cache record type. */
        Type: "internal" | "frontend" | "source.local" | "source.git.checkout" | "exec.cachemount" | "regular"
        /** Description of the build-step that produced the build cache. */
        Description: string,
        /** Indicates if the build cache is in use. */
        InUse: boolean,
        /** Indicates if the build cache is shared. */
        Shared: boolean,
        /** Amount of disk space used by the build cache (in bytes). */
        Size: number,
        /** 
         * Date and time at which the build cache was created in RFC 3339 format with nano-seconds.
         * @see https://www.ietf.org/rfc/rfc3339.txt
         */
        CreatedAt: string,
        /** 
         * Date and time at which the build cache was last used in RFC 3339 format with nano-seconds. 
         * @see https://www.ietf.org/rfc/rfc3339.txt
         */
        LastUsedAt: string | null,
    }[]
}
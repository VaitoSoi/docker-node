import type { StringObject } from "./global";

export interface SwarmOrchestration {
    /** The number of historic tasks to keep per instance or node. If negative, never remove completed or failed tasks. */
    TaskHistoryRetentionLimit: number
}

export interface SwarmRaft {
    /** The number of log entries between snapshots. */
    SnapshotInterval: number,
    /** The number of snapshots to keep beyond the current snapshot. */
    KeepOldSnapshots: number,
    /** The number of log entries to keep around to sync up slow followers after a snapshot is created. */
    LogEntriesForSlowFollowers: number,
    /** 
     * The number of ticks that a follower will wait for a message from the leader before becoming a candidate and starting an election. `ElectionTick` must be greater than `HeartbeatTick`.
     * 
     * A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.
     */
    ElectionTick: number,
    /** 
     * The number of ticks between heartbeats. Every HeartbeatTick ticks, the leader will send a heartbeat to the followers.
     * 
     * A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.
     */
    HeartbeatTick: number,
}

export interface SwarmDispatcher {
    /** The delay for an agent to send a heartbeat to the dispatcher. */
    HeartbeatPeriod: number,
}

export interface SwarmCAConfig {
    /** The duration node certificates are issued for. */
    NodeCertExpiry: number,
    /** Configuration for forwarding signing requests to an external certificate authority. */
    ExternalCAs: {
        /** Protocol for communication with the external CA (currently only `cfssl` is supported). */
        Protocol: "cfssl",
        /** URL where certificate signing requests should be sent */
        URL: string,
        /** An object with key/value pairs that are interpreted as protocol-specific options for the external CA driver. */
        Options: StringObject,
        /** The root CA certificate (in PEM format) this external CA uses to issue TLS certificates (assumed to be to the current swarm root CA certificate if not provided). */
        CACert: string
    }[],
    /** The desired signing CA certificate for all swarm node TLS leaf certificates, in PEM format. */
    SigningCACert: string,
    /** 
    The desired signing CA key for all swarm node TLS leaf certificates, in PEM format. */
    SigningCAKey: string,
    /**An integer whose purpose is to force swarm to generate a new signing CA certificate and key, if none have been specified in `SigningCACert` and `SigningCAKey`  */
    ForceRotate: number
}

export interface SwarmEncryptionConfig {
    /** If set, generate a key and use it to lock data stored on the managers. */
    AutoLockManagers: boolean
}

export interface SwarmTaskDefaults {
    /** 
     * The log driver to use for tasks created in the orchestrator if unspecified by a service.
     * 
     * Updating this value only affects new tasks. Existing tasks continue to use their previously configured log driver until recreated.
     */
    LogDriver: {
        /** The log driver to use as a default for new tasks. */
        Name: string,
        /** Driver-specific options for the selected log driver, specified as key/value pairs. */
        Options: StringObject
    }
}

export interface SwarmSpec {
    /** Name of the swarm. */
    Name: string,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** Orchestration configuration. */
    Orchestration: SwarmOrchestration | null,
    /** Raft configuration. */
    Raft: SwarmRaft,
    /** Dispatcher configuration. */
    Dispatcher: SwarmDispatcher | null,
    /** CA configuration. */
    CAConfig: SwarmCAConfig | null,
    /** Parameters related to encryption-at-rest. */
    EncryptionConfig: SwarmEncryptionConfig,
    /** Defaults for creating tasks in this cluster. */
    TaskDefaults: SwarmTaskDefaults
}

/*
 * Inspect
 */
export interface InspectSwarm {
    /** The ID of the swarm. */
    ID: string,
    /** 
     * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
     *
     *This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
     */
    Version: {
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
        CertIssuerPublicKey: string,
    },
    /** Whether there is currently a root CA rotation in progress for the swarm */
    RootRotationInProgress: boolean,
    /** DataPathPort specifies the data path port number for data traffic. Acceptable port range is 1024 to 49151. If no port is set or is set to 0, the default port (4789) is used. */
    DataPathPort: number,
    /** Default Address Pool specifies default subnet pools for global scope networks. */
    DefaultAddrPool: string[],
    /** SubnetSize specifies the subnet size of the networks created from the default subnet pool. */
    SubnetSize: number,
    /** JoinTokens contains the tokens workers and managers need to join the swarm. */
    JoinTokens: {
        /** The token workers can use to join the swarm. */
        Worker: string,
        /** The token managers can use to join the swarm. */
        Manager: string
    }
}

/*
 * Init
 */
export interface InitSwarmOption {
    /** Listen address used for inter-manager communication, as well as determining the networking interface used for the VXLAN Tunnel Endpoint (VTEP). This can either be an address/port combination in the form `192.168.1.1:4567`, or an interface followed by a port number, like `eth0:4567`. If the port number is omitted, the default swarm listening port is used. */
    ListenAddr: string,
    /** Externally reachable address advertised to other nodes. This can either be an address/port combination in the form `192.168.1.1:4567`, or an interface followed by a port number, like eth0:4567. If the port number is omitted, the port number from the listen address is used. If `AdvertiseAddr` is not specified, it will be automatically detected when possible. */
    AdvertiseAddr: string,
    /** 
     * Address or interface to use for data path traffic (format: `<ip|interface>`), for example, `192.168.1.1`, or an interface, like `eth0`. If `DataPathAddr` is unspecified, the same address as AdvertiseAddr is used.
     *
      *The `DataPathAddr` specifies the address that global scope network drivers will publish towards other nodes in order to reach the containers running on this node. Using this parameter it is possible to separate the container data traffic from the management traffic of the cluster.
     */
    DataPathAddr: string,
    /** DataPathPort specifies the data path port number for data traffic. Acceptable port range is 1024 to 49151. if no port is set or is set to 0, default port 4789 will be used. */
    DataPathPort: number,
    /** Default Address Pool specifies default subnet pools for global scope networks. */
    DefaultAddrPool: string[],
    /** Force creation of a new swarm. */
    ForceNewCluster: boolean,
    /**SubnetSize specifies the subnet size of the networks created from the default subnet pool.  */
    SubnetSize: number,
    /** User modifiable swarm configuration. */
    Spec: SwarmSpec,
}

export interface InitSwarmResponse {
    Id: string
}

/*
 * Join 
 */
export interface JoinSwarm {
    /** Listen address used for inter-manager communication if the node gets promoted to manager, as well as determining the networking interface used for the VXLAN Tunnel Endpoint (VTEP). */
    ListenAddr: string,
    /** Externally reachable address advertised to other nodes. This can either be an address/port combination in the form `192.168.1.1:4567`, or an interface followed by a port number, like `eth0:4567`. If the port number is omitted, the port number from the listen address is used. If `AdvertiseAddr` is not specified, it will be automatically detected when possible. */
    AdvertiseAddr: string,
    /** 
     * Address or interface to use for data path traffic (format: `<ip|interface>`), for example, `192.168.1.1`, or an interface, like `eth0`. If `DataPathAddr` is unspecified, the same address as AdvertiseAddr is used.
     * 
     * The DataPathAddr specifies the address that global scope network drivers will publish towards other nodes in order to reach the containers running on this node. Using this parameter it is possible to separate the container data traffic from the management traffic of the cluster.
     */
    DataPathAddr: string,
    /** Addresses of manager nodes already participating in the swarm. */
    RemoteAddrs: string[],
    /** Secret token for joining this swarm. */
    JoinToken: string
}

/*
 * Update 
 */
export interface UpdateSwarmParam {
    /** The version number of the swarm object being updated. This is required to avoid conflicting writes. */
    version: number,
    /** Rotate the worker join token. */
    rotateWorkerToken?: boolean,
    /** Rotate the manager join token. */
    rotateManagerToken?: boolean,
    /** Rotate the manager unlock key. */
    rotateManagerUnlockKey?: boolean,
}

export interface UpdateSwarmBody {
    /** Name of the swarm. */
    Name?: string,
    /** User-defined key/value metadata. */
    Labels?: StringObject,
    /** Orchestration configuration. */
    Orchestration?: SwarmOrchestration | null,
    /** Raft configuration. */
    Raft?: SwarmRaft,
    /** Dispatcher configuration. */
    Dispatcher?: SwarmDispatcher,
    /** CA configuration. */
    CAConfig?: SwarmCAConfig,
    /** Parameters related to encryption-at-rest. */
    EncryptionConfig?: SwarmEncryptionConfig,
    /** Defaults for creating tasks in this cluster. */
    TaskDefaults?: SwarmTaskDefaults
}

export interface UpdateSwarmOption extends UpdateSwarmParam, UpdateSwarmBody { }

/* 
 * Get unlock key
 */
export interface SwarmUnlockKey {
    /** The swarm's unlock key. */
    UnlockKey: string
}
import type { EndpointPortConfig, StringObject, TaskSpec, TaskSpecNetwork } from "./global";


export interface ServiceBaseConfig {
    /** Maximum number of tasks to be rolled back in one iteration (0 means unlimited parallelism). */
    Parallelism: number,
    /** Amount of time between rollback iterations / updates, in nanoseconds. */
    Delay: number,
    /** Amount of time to monitor each updated / rolled task for failures, in nanoseconds. */
    Monitor: number,
    /** The fraction of tasks that may fail during a rollback / update before the failure action is invoked, specified as a floating point number between 0 and 1. */
    MaxFailureRatio: number,
    /** The order of operations when rolling out a task. Either the old task is shut down before the new task is started, or the new task is started before the old task is shut down. */
    Order: "stop-first" | "start-first"
}

export type ServiceEndpointSpec = {
    /** The mode of resolution to use for internal load balancing between tasks. */
    Mode: "dnsrr",
} | {
    /** The mode of resolution to use for internal load balancing between tasks. */
    Mode: "vip",
    /** List of exposed ports that this service is accessible on from the outside.  */
    Ports: EndpointPortConfig[]
}

export interface ServiceSpecMode {
    Replicated: {
        Replicas: number
    },
    Global: object,
    /** The mode used for services with a finite number of tasks that run to a completed state. */
    ReplicatedJob: {
        /** The maximum number of replicas to run simultaneously. */
        MaxConcurrent: number,
        /** The total number of replicas desired to reach the Completed state. If unset, will default to the value of MaxConcurrent */
        TotalCompletions: number
    },
    /** The mode used for services which run a task to the completed state on each valid node. */
    GlobalJob: object
}

export interface ServiceUpdateConfig extends ServiceBaseConfig {
    /** Action to take if an updated task fails to run, or stops running during the update. */
    FailureAction: "continue" | "pause" | "rollback"
}

export interface ServiceRollbackConfig extends ServiceBaseConfig {
    /** Action to take if an rolled back task fails to run, or stops running during the rollback. */
    FailureAction: "continue" | "pause"
}

export interface ServiceObject {
    ID: string,
    /** 
     * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
     *
     *This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
     */
    Version: {
        Index: number
    },
    CreatedAt: string,
    UpdatedAt: string,
    /** User modifiable configuration for a service. */
    Spec: {
        /**Name of the service.  */
        Name: string,
        /** User-defined key/value metadata. */
        Labels: StringObject,
        /** 
         * User modifiable task configuration.
         * 
         * Note: `ContainerSpec`, `NetworkAttachmentSpec`, and `PluginSpec` are mutually exclusive. `PluginSpec` is only used when the Runtime field is set to `plugin`. `NetworkAttachmentSpec` is used when the Runtime field is set to `attachment`.
         */
        TaskTemplate: TaskSpec,
        /** Scheduling mode for the service. */
        Mode: ServiceSpecMode,
        /** Specification for the update strategy of the service. */
        UpdateConfig: ServiceUpdateConfig,
        /** Specification for the rollback strategy of the service. */
        RollbackConfig: ServiceRollbackConfig,
        /** 
         * Specifies which networks the service should attach to.
         * 
         * @deprecated This field is deprecated since v1.44. The Networks field in TaskSpec should be used instead.
         */
        Networks: TaskSpecNetwork[],
        /** Properties that can be configured to access and load balance a service. */
        EndpointSpec: ServiceEndpointSpec
    },
    Endpoint: {
        /** Properties that can be configured to access and load balance a service. */
        Spec: ServiceEndpointSpec,
        Ports: EndpointPortConfig[],
        VirtualIPs: {
            NetworkID: string,
            Addr: string
        }[]
    },
    /** The status of a service update. */
    UpdateStatus: {
        State: "updating" | "paused" | "completed",
        StartedAt: string,
        CompletedAt: string,
        Message: string
    },
    /** The status of the service's tasks. Provided only when requested as part of a ServiceList operation. */
    ServiceStatus: {
        /** The number of tasks for the service currently in the Running state. */
        RunningTasks: number,
        /** The number of tasks for the service desired to be running. For replicated services, this is the replica count from the service spec. For global services, this is computed by taking count of all tasks for the service with a Desired State other than Shutdown. */
        DesiredTasks: number,
        /** The number of tasks for a job that are in the Completed state. This field must be cross-referenced with the service type, as the value of 0 may mean the service is not in a job mode, or it may mean the job-mode service has no tasks yet Completed. */
        CompletedTasks: number
    },
    /** The status of the service when it is in one of ReplicatedJob or GlobalJob modes. Absent on Replicated and Global mode services. The JobIteration is an ObjectVersion, but unlike the Service's version, does not need to be sent with an update request. */
    JobStatus: {
        /** 
         * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
         * 
         * This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
         */
        JobIteration: {
            Index: number
        },
        /** The last time, as observed by the server, that this job was started. */
        LastExecution: string
    }
}

/*
 * List
 */
export interface ListServiceFilter {
    id: string,
    label: string,
    mode: "replicated" | "global",
    name: string
}

/*
 * Create
 */
export interface CreateServiceOption {
    /** Name of the service. */
    Name?: string,
    /** User-defined key/value metadata. */
    Labels?: StringObject,
    /** User modifiable task configuration. */
    TaskTemplate?: TaskSpec,
    /** Scheduling mode for the service */
    Mode?: ServiceSpecMode,
    /** Specification for the update strategy of the service. */
    UpdateConfig?: ServiceUpdateConfig,
    /** Specification for the rollback strategy of the service. */
    RollbackConfig?: ServiceRollbackConfig,
    /** 
     * Specifies which networks the service should attach to.
     * 
     * @deprecated This field is deprecated since v1.44. The Networks field in TaskSpec should be used instead.
     */
    Networks?: TaskSpecNetwork[],
    /** Properties that can be configured to access and load balance a service. */
    EndpointSpec?: ServiceEndpointSpec
}

export interface CreateServiceResponse {
    ID: string,
    Warnings: string[] | null
}

/*
 * Update
 */
export interface UpdateServiceParam {
    /** The version number of the service object being updated. This is required to avoid conflicting writes. This version number should be the value as currently set on the service before the update. You can find the current version by calling `GET /services/{id}` */
    version: number,
    /** If the `X-Registry-Auth` header is not specified, this parameter indicates where to find registry authorization credentials. */
    registryAuthFrom: "spec" | "previous-spec",
    /** Set to this parameter to previous to cause a server-side rollback to the previous service spec. The supplied spec will be ignored in this case. */
    rollback: string
}

export interface UpdateServiceOption extends UpdateServiceParam, CreateServiceOption { }

export interface UpdateServiceResponse {
    /** Optional warning messages */
    Warnings: string[]
}
import type { StringObject, GenericResource, TaskSpec, EndpointPortConfig } from "./global";

export type TaskState = "new" | "allocated" | "pending" | "assigned" | "accepted" | "preparing" | "ready" | "starting" | "running" | "complete" | "shutdown" | "failed" | "rejected" | "remove" | "orphaned";

export interface TaskObject {
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
    /** Name of the task. */
    Name: string
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** User modifiable task configuration. */
    Spec: TaskSpec,
    /** The ID of the service this task is part of. */
    ServiceID: string,
    Slot: number,
    /** The ID of the node that this task is on. */
    NodeID: string,
    /** User-defined resources can be either Integer resources (e.g, `SSD=3`) or String resources (e.g, `GPU=UUID1`). */
    AssignedGenericResources: GenericResource[],
    /** Represents the status of a task. */
    Status: {
        Timestamp: string,
        State: TaskState,
        Message: string,
        Err: string,
        /** represents the status of a container. */
        ContainerStatus: {
            ContainerID: string,
            PID: number,
            ExitCode: number
        },
        /** Represents the port status of a task's host ports whose service has published host ports */
        PortStatus: EndpointPortConfig,
    },
    DesiredState: TaskState,
    /** 
     * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
     * 
     * This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
     */
    JobIteration: {
        Index: number
    }
}

/*
 * List
 */
export interface ListTaskFilter {
    "desired-state"?: "running" | "shutdown" | "accepted",
    id?: string,
    label?: string,
    name?: string,
    node?: string,
    service?: string
}
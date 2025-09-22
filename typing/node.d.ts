import type { StringObject, Platform, Resource } from "./global";

export type NodeRole = "manager" | "worker"
export type NodeAvailability = "active" | "pause" | "drain"

export interface NodeObject {
    ID: string,
    /** 
     * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
     * 
     * This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
     */
    Version: {
        Index: number
    },
    /** 
     * Date and time at which the node was added to the swarm in RFC 3339 format with nano-seconds.
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    CreatedAt: string,
    /** 
     * Date and time at which the node was last updated in RFC 3339 format with nano-seconds.
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    UpdatedAt: string,
    Spec: {
        /** Name for the node. */
        Name: string,
        /** User-defined key/value metadata. */
        Labels: StringObject,
        /** Role of the node. */
        Role: NodeRole,
        /** Availability of the node. */
        Availability: NodeAvailability
    },
    /** NodeDescription encapsulates the properties of the Node as reported by the agent. */
    Description: {
        Hostname: string,
        /** Platform represents the platform (Arch/OS). */
        Platform: Platform,
        /** An object describing the resources which can be advertised by a node and requested by a task. */
        Resources: Resource,
        /** EngineDescription provides information about an engine. */
        Engine: {
            EngineVersion: string,
            Labels: StringObject,
            Plugins: {
                Type: string,
                Name: string
            }[]
        },
        /** Information about the issuer of leaf TLS certificates and the trusted root CA certificate. */
        TLSInfo: {
            /** The root CA certificate(s) that are used to validate leaf TLS certificates. */
            TrustRoot: string,
            /** The base64-url-safe-encoded raw subject bytes of the issuer. */
            CertIssuerSubject: string,
            /** The base64-url-safe-encoded raw public key bytes of the issuer. */
            CertIssuerPublicKey: string,
        }
    },
    /** 
     * NodeStatus represents the status of a node.
     * 
     * It provides the current status of the node, as seen by the manager.
     */
    Status: {
        /** NodeState represents the state of a node. */
        State: "unknown" | "down" | "ready" | "disconnected",
        Message: string,
        /** IP address of the node. */
        Addr: string,
    },
    /** 
     * ManagerStatus represents the status of a manager.
     * 
     * It provides the current status of a node's manager component, if the node is a manager.
     */
    ManagerStatus: {
        Leader: boolean,
        /** Reachability represents the reachability of a node. */
        Reachability: "unknown" | "unreachable" | "reachable",
        /** The IP address and port at which the manager is reachable. */
        Addr: string
    } | null
}

/* 
 * List
 */
export interface ListNodeFilter {
    id: string,
    label: string,
    membership: "accepted" | "pending",
    name: string,
    "node.label": string,
    role: NodeRole
}

/*
 * Update
 */
export interface UpdateNodeParam {
    /** The version number of the node object being updated. This is required to avoid conflicting writes. */
    version: number
}

export interface UpdateNodeBody {
    /** Name for the node. */
    Name?: string,
    /** User-defined key/value metadata. */
    Labels?: StringObject,
    /** Role of the node. */
    Role?: NodeRole,
    /** Availability of the node. */
    Availability?: NodeAvailability
}

export interface UpdateNodeOption extends UpdateNodeParam, UpdateNodeBody { }

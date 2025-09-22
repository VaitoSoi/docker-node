import type { StringObject } from "./global";

export interface SecretSpec {
    /** User-defined name of the secret. */
    Name: string,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** 
     * Data is the data to store as a secret, formatted as a Base64-url-safe-encoded (RFC 4648) string. It must be empty if the Driver field is set, in which case the data is loaded from an external secret store. The maximum allowed size is 500KB, as defined in MaxSecretSize.
     * 
     * This field is only used to create a secret, and is not returned by other endpoints.
     * 
     * @see https://pkg.go.dev/github.com/moby/swarmkit/v2@v2.0.0-20250103191802-8c1959736554/api/validation#MaxSecretSize
     * @see https://tools.ietf.org/html/rfc4648#section-5
     */
    Data?: string,
    /** Driver represents a driver (network, logging, secrets). */
    Driver: {
        /** Name of the driver. */
        Name: string,
        /** Key/value map of driver-specific options. */
        Options: StringObject
    },
    /** Driver represents a driver (network, logging, secrets). */
    Templating: {
        /** Name of the driver. */
        Name: string,
        /** Key/value map of driver-specific options. */
        Options: StringObject
    }
}

export interface SecretObject {
    /**  */
    ID: string,
    /** 
     * The version number of the object such as node, service, etc. This is needed to avoid conflicting writes. The client must send the version number along with the modified specification when updating these objects.
     * 
     * This approach ensures safe concurrency and determinism in that the change on the object may not be applied if the version number has changed from the last read. In other words, if two update requests specify the same base version, only one of the requests can succeed. As a result, two separate update requests that happen at the same time will not unintentionally overwrite each other.
     */
    Version: {
        Index: number
    },
    CreatedAt: string,
    UpdatedAt: string,
    Spec: SecretSpec
}

/*
 * List
 */
export interface ListSecretFilter {
    id?: string,
    label?: string,
    name?: string,
    names?: string[]
}

/*
 * Create
 */
export interface CreateSecretResponse {
    /** The id of the newly created object. */
    Id: string,
}

/*
 * Update
 */
export interface UpdateSecretParam {
    /** The version number of the secret object being updated. This is required to avoid conflicting writes. */
    version: number
}

export interface UpdateSecretBody {
    /** User-defined key/value metadata. */
    Labels: StringObject
}

export interface UpdateSecretOption extends UpdateSecretParam, UpdateSecretBody { }

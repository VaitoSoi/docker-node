import type { StringObject } from "./global";

export interface ConfigSpec {
    /** User-defined name of the config. */
    Name: string,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** 
     * Data is the data to store as a config, formatted as a Base64-url-safe-encoded (RFC 4648) string. It must be empty if the Driver field is set, in which case the data is loaded from an external config store. The maximum allowed size is 500KB, as defined in MaxConfigSize.
     * 
     * @see https://pkg.go.dev/github.com/moby/swarmkit/v2@v2.0.0-20250103191802-8c1959736554/manager/controlapi#MaxConfigSize
     * @see https://tools.ietf.org/html/rfc4648#section-5
     */
    Data?: string,
    /** Driver represents a driver (network, logging, configs). */
    Driver: {
        /** Name of the driver. */
        Name: string,
        /** Key/value map of driver-specific options. */
        Options: StringObject
    },
    /** Driver represents a driver (network, logging, configs). */
    Templating: {
        /** Name of the driver. */
        Name: string,
        /** Key/value map of driver-specific options. */
        Options: StringObject
    }
}

export interface ConfigObject {
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
    Spec: ConfigSpec
}

/*
 * List
 */
export interface ListConfigFilter {
    id?: string,
    label?: string,
    name?: string,
    names?: string[]
}

/*
 * Create
 */
export interface CreateConfigResponse {
    /** The id of the newly created object. */
    Id: string,
}

/*
 * Update
 */
export interface UpdateConfigParam {
    /** The version number of the config object being updated. This is required to avoid conflicting writes. */
    version: number
}

export interface UpdateConfigBody {
    /** User-defined key/value metadata. */
    Labels: StringObject
}

export interface UpdateConfigOption extends UpdateConfigParam, UpdateConfigBody { }

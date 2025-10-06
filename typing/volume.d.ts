import type { StringObject } from "./global";

export interface ClusterVolumeSpec {
    /** Group defines the volume group of this volume. Volumes belonging to the same group can be referred to by group name when creating Services. Referring to a volume by group instructs Swarm to treat volumes in that group interchangeably for the purpose of scheduling. Volumes with an empty string for a group technically all belong to the same, emptystring group. */
    Group: string,
    /** Defines how the volume is used by tasks. */
    AccessMode: {
        /** 
         * The set of nodes this volume can be used on at one time.
         * + `single` The volume may only be scheduled to one node at a time.
         * + `multi` the volume may be scheduled to any supported number of nodes at a time.
         */
        Scope: "single" | "multi",
        /** 
         * The number and way that different tasks can use this volume at one time.
         * + `none` The volume may only be used by one task at a time.
         * + `readonly` The volume may be used by any number of tasks, but they all must mount the volume as readonly
         * + `onewriter` The volume may be used by any number of tasks, but only one may mount it as read/write.
         * + `all` The volume may have any number of readers and writers.
         */
        Sharing: "none" | "readonly" | "onewriter" | "all",
        /**  */
        MountVolume: {
            /** Specifies the filesystem type for the mount volume. */
            FsType: string,
            /** Flags to pass when mounting the volume */
            MountFlags: string[],
            /** Options for using this volume as a Block-type volume. Intentionally empty. */
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            BlockVolume: {}
        },
        /** Swarm Secrets that are passed to the CSI storage plugin when operating on this volume. */
        Secrets: {
            /** Key is the name of the key of the key-value pair passed to the plugin. */
            Key: string,
            /** Secret is the swarm Secret object from which to read data. This can be a Secret name or ID. The Secret data is retrieved by swarm and used as the value of the key-value pair passed to the plugin. */
            Secret: string
        }[],
        /** Requirements for the accessible topology of the volume. These fields are optional. For an in-depth description of what these fields mean, see the CSI specification. */
        AccessibilityRequirements: {
            /** A list of required topologies, at least one of which the volume must be accessible from. */
            Requisite: StringObject[],
            /** A list of topologies that the volume should attempt to be provisioned in. */
            Preferred: StringObject[]
        },
        /** The desired capacity that the volume should be created with. If empty, the plugin will decide the capacity. */
        CapacityRange: {
            /** The volume must be at least this big. The value of 0 indicates an unspecified minimum */
            RequiredBytes: number,
            /** The volume must not be bigger than this. The value of 0 indicates an unspecified maximum. */
            LimitBytes: number,
        },
        /** 
         * The availability of the volume for use in tasks.
         * + `active` The volume is fully available for scheduling on the cluster
         * + `pause` No new workloads should use the volume, but existing workloads are not stopped.
         * + `drain` All workloads using this volume should be stopped and rescheduled, and no new ones should be started.
         */
        Availability: "active" | "pause" | "drain"
    }
}

export interface VolumeObject {
    /** Name of the volume. */
    Name: string,
    /** Name of the volume driver used by the volume. */
    Driver: string,
    /** Mount path of the volume on the host. */
    Mountpoint: string,
    /** Date/Time the volume was created. */
    CreatedAt: string,
    /** 
     * Low-level details about the volume, provided by the volume driver. 
     * 
     * The `Status` field is optional, and is omitted if the volume driver does not support this feature.
     */
    Status: StringObject,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** The level at which the volume exists. Either `global` for cluster-wide, or `local` for machine level. */
    Scope: "local" | "global",
    /** Options and information specific to, and only present on, Swarm CSI cluster volumes. */
    ClusterVolume: {
        /** The Swarm ID of this volume. Because cluster volumes are Swarm objects, they have an ID, unlike non-cluster volumes. This ID can be used to refer to the Volume instead of the name. */
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
        /** Cluster-specific options used to create the volume. */
        Spec: ClusterVolumeSpec,
        /** Information about the global status of the volume. */
        Info: {
            /** The capacity of the volume in bytes. A value of 0 indicates that the capacity is unknown. */
            CapacityBytes: number,
            /** A map of strings to strings returned from the storage plugin when the volume is created. */
            VolumeContext: StringObject,
            /** The ID of the volume as returned by the CSI storage plugin. This is distinct from the volume's ID as provided by Docker. This ID is never used by the user when communicating with Docker to refer to this volume. If the ID is blank, then the Volume has not been successfully created in the plugin yet. */
            VolumeID: string,
            /** The topology this volume is actually accessible from. */
            AccessibleTopology: StringObject[]
        },
        /** The status of the volume as it pertains to its publishing and use on specific nodes */
        PublishStatus: {
            /** The ID of the Swarm node the volume is published on. */
            NodeID: string,
            /** 
             * The published state of the volume.
             * + `pending-publish` The volume should be published to this node, but the call to the controller plugin to do so has not yet been successfully completed.
             * + `published` The volume is published successfully to the node.
             * + `pending-node-unpublish` The volume should be unpublished from the node, and the manager is awaiting confirmation from the worker that it has done so.
             * + `pending-controller-unpublish` The volume is successfully unpublished from the node, but has not yet been successfully unpublished on the controller.
             */
            State: "pending-publish" | "published" | "pending-node-unpublish" | "pending-controller-unpublish",
            /** A map of strings to strings returned by the CSI controller plugin when a volume is published. */
            PublishContext: StringObject
        }[]
    },
    /** The driver specific options used when creating the volume. */
    Options: StringObject,
    /** Usage details about the volume. This information is used by the GET `/system/df` endpoint, and omitted in other endpoints. */
    UsageData: {
        /** Amount of disk space used by the volume (in bytes). This information is only available for volumes created with the `"local"` volume driver. For volumes created with other volume drivers, this field is set to `-1` ("not available") */
        Size: number,
        /** The number of containers referencing this volume. This field is set to `-1` if the reference-count is not available. */
        RefCount: number
    }
}

/*
 * List
 */
export interface ListVolumeFilter {
    dangling?: boolean,
    driver?: string,
    label?: string,
    name?: string
}

export interface ListVolumeResponse {
    /** List of volumes */
    Volumes: VolumeObject[],
    /** Warnings that occurred when fetching the list of volumes. */
    Warnings: string[]
}

/*
 * Create
 */
export interface CreateVolumeOption {
    /** The new volume's name. If not specified, Docker generates a name. */
    Name: string,
    /** Name of the volume driver to use. */
    Driver?: string,
    /** A mapping of driver options and values. These options are passed directly to the driver and are driver specific. */
    DriverOpts?: StringObject,
    /** User-defined key/value metadata. */
    Labels?: StringObject,
    /** Cluster-specific options used to create the volume. */
    ClusterVolumeSpec?: ClusterVolumeSpec
}

/* 
 * Update
 */
export interface UpdateVolumeParam {
    /** The version number of the volume being updated. This is required to avoid conflicting writes. Found in the volume's `ClusterVolume` field. */
    version: string,
}

export interface UpdateVolumeBody {
    /** Cluster-specific options used to create the volume. */
    Spec: {
        /** Defines how the volume is used by tasks. */
        AccessMode: {
            /** 
             * The availability of the volume for use in tasks.
             * + `active` The volume is fully available for scheduling on the cluster
             * + `pause` No new workloads should use the volume, but existing workloads are not stopped.
             * + `drain` All workloads using this volume should be stopped and rescheduled, and no new ones should be started.
             */
            Availability: "active" | "pause" | "drain"
        }
    }
}

export interface UpdateVolumeOption extends UpdateVolumeParam, UpdateVolumeBody { }

/*
 * Prune
 */
export interface PruneVolumeFilter {
    label?: string,
    all?: true
}

export interface PruneVolumeResponse {
    VolumesDeleted: string[],
    SpaceReclaimed: number
}

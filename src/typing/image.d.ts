import type { Env, ExposedPorts, GraphDriver, HealthCheck, StringObject } from "./main";

export interface DescriptorPlaform {
    /** The CPU architecture. */
    architecture: string,
    /** The operating system. */
    os: string,
    /** Optional field specifying the operating system version. */
    "os.version": string,
    /** Optional field specifying an array of strings, each listing a required OS feature. */
    "os.features": string[],
    /** Optional field specifying a variant of the CPU. */
    variant: string
}

export interface ImageManifestDescriptor {
    /** The media type of the object this schema refers to. */
    mediaType: string,
    /** The digest of the targeted content. */
    digest: string,
    /** The size in bytes of the blob. */
    size: number,
    /** List of URLs from which this object MAY be downloaded. */
    urls: string[] | null,
    /** Arbitrary metadata relating to the targeted content. */
    annotations: StringObject | null,
    /** Data is an embedding of the targeted content. This is encoded as a base64 string when marshalled to JSON (automatically, by encoding/json). */
    data: string | null,
    /** 
     * Describes the platform which the image in the manifest runs on, as defined in the OCI Image Index Specification.
     * 
     * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/image-index.md
     */
    platform: DescriptorPlaform,
    /** ArtifactType is the IANA media type of this artifact. */
    artifactType: string | null
}

export interface ImageManifest {
    /** ID is the content-addressable ID of an image and is the same as the digest of the image manifest. */
    ID: string,
    /**
     * A descriptor struct containing digest, media type, and size, as defined in the OCI Content Descriptors Specification.
     * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/descriptor.md
     */
    Descriptor: ImageManifestDescriptor,
    /** Indicates whether all the child content (image config, layers) is fully available locally. */
    Available: boolean,
    Size: {
        /** Total is the total size (in bytes) of all the locally present data (both distributable and non-distributable) that's related to this manifest and its children. This equal to the sum of `[Content]` size AND all the sizes in the `[Size]` struct present in the Kind-specific data struct. For example, for an image kind (`Kind == "image"`) this would include the size of the image content and unpacked image snapshots (`[Size.Content] + [ImageData.Size.Unpacked]`). */
        Total: number,
        /** Content is the size (in bytes) of all the locally present content in the content store (e.g. image config, layers) referenced by this manifest and its children. This only includes blobs in the content store. */
        Content: number
    },
    /** The kind of the manifest. */
    Kind: "image" | "attestation" | "unknown",
    /** The image data for the image manifest. This field is only populated when Kind is "image". */
    ImageData: {
        /** 
         * Describes the platform which the image in the manifest runs on, as defined in the OCI Image Index Specification.
         * 
         * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/image-index.md
         */
        Platform: DescriptorPlaform,
        /** The IDs of the containers that are using this image. */
        Containers: string[],
        Size: {
            /** Unpacked is the size (in bytes) of the locally unpacked (uncompressed) image content that's directly usable by the containers running this image. It's independent of the distributable content - e.g. the image might still have an unpacked data that's still used by some container even when the distributable/compressed content is already gone. */
            Unpacked: number
        }
    } | null,
    /** The image data for the attestation manifest. This field is only populated when Kind is "attestation". */
    AttestationData: {
        /** The digest of the image manifest that this attestation is for. */
        For: string,
    } | null
}

/* List */
export interface ListFilter {
    before?: string,
    dangling?: true,
    label?: string,
    reference?: string,
    since?: string,
    until?: string,
}

export interface ListImage {
    /** 
     * ID is the content-addressable ID of an image.
     * 
     * This identifier is a content-addressable digest calculated from the image's configuration (which includes the digests of layers used by the image).
     * 
     * Note that this digest differs from the `RepoDigests` below, which holds digests of image manifests that reference the image.
     */
    Id: string,
    /** 
     * ID of the parent image.
     * 
     * Depending on how the image was created, this field may be empty and is only set for images that were built/created locally. This field is empty if the image was pulled from an image registry.
     */
    ParentId: string,
    /** 
     * List of image names/tags in the local image cache that reference this image.
     * 
     * Multiple image tags can refer to the same image, and this list may be empty if no tags reference the image, in which case the image is "untagged", in which case it can still be referenced by its ID.
     */
    RepoTags: string[],
    /** 
     * List of content-addressable digests of locally available image manifests that the image is referenced from. Multiple manifests can refer to the same image.
     * 
     * These digests are usually only available if the image was either pulled from a registry, or if the image was pushed to a registry, which is when the manifest is generated and its digest calculated.
     */
    RepoDigests: string[],
    /** Date and time at which the image was created as a Unix timestamp (number of seconds since EPOCH). */
    Created: number,
    /** Total size of the image including all layers it is composed of. */
    Size: number,
    /** 
     * Total size of image layers that are shared between this image and other images.
     * 
     * This size is not calculated by default. `-1` indicates that the value has not been set / calculated.
     */
    SharedSize: number,
    /** 
     * Total size of the image including all layers it is composed of.
     * 
     * @deprecated This field is omitted in API v1.44, but kept for backward compatibility. Use Size instead.
     */
    VirtualSize: number | undefined,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** 
     * Number of containers using this image. Includes both stopped and running containers.
     * 
     * `-1` indicates that the value has not been set / calculated.
     */
    Containers: number,
    /** 
     * Manifests is a list of manifests available in this image. It provides a more detailed view of the platform-specific image manifests or other image-attached data like build attestations.
     *
     * WARNING: This is experimental and may change at any time without any backward compatibility.
     */
    Manifests: ImageManifest[],
    /**
     * A descriptor struct containing digest, media type, and size, as defined in the OCI Content Descriptors Specification.
     * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/descriptor.md
     */
    Descriptor: ImageManifestDescriptor
}

/* Build */
export interface BuildOption {
    /** Path within the build context to the `Dockerfile`. This is ignored if `remote` is specified and points to an external `Dockerfile`. */
    dockerfile?: string,
    /** A name and optional tag to apply to the image in the `name:tag` format. If you omit the tag the default `latest` value is assumed. */
    t?: `${string}:${string}`,
    /** Extra hosts to add to /etc/hosts */
    extrahosts?: string,
    /** A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are placed into a file called `Dockerfile` and the image is built from that file. If the URI points to a tarball, the file is downloaded by the daemon and the contents therein used as the context for the build. If the URI points to a tarball and the `dockerfile` parameter is also specified, there must be a file with the corresponding path inside the tarball. */
    remote?: string,
    /** Suppress verbose build output. */
    q?: boolean,
    /** Do not use the cache when building the image. */
    nocache?: boolean,
    /** JSON array of images used for build cache resolution. */
    cachefrom?: object,
    /** Attempt to pull the image even if an older image exists locally. */
    pull?: string,
    /** Remove intermediate containers after a successful build. */
    rm?: boolean,
    /** Always remove intermediate containers, even upon failure. */
    forcerm?: boolean,
    /** Set memory limit for build. */
    memory?: number,
    /** Total memory (memory + swap). Set as -1 to disable swap. */
    memswap?: number,
    /** CPU shares (relative weight). */
    cpushares?: number,
    /** CPUs in which to allow execution (e.g., `0-3`, `0,1`). */
    cpusetcpus?: string,
    /** The length of a CPU period in microseconds. */
    cpuperiod?: number,
    /** Microseconds of CPU time that the container can get in a CPU period. */
    cpuquota?: number,
    /** 
     * JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the buildargs as the environment context for commands run via the `Dockerfile` RUN instruction, or for variable expansion in other `Dockerfile` instructions. This is not meant for passing secret values.
     * 
     * For example, the build arg `FOO=bar` would become `{"FOO":"bar"}` in JSON. This would result in the query parameter `buildargs={"FOO":"bar"}`. Note that `{"FOO":"bar"}` should be URI component encoded.
     *
     * @see https://docs.docker.com/engine/reference/builder/#arg
     */
    buildargs?: string,
    /** Size of `/dev/shm` in bytes. The size must be greater than 0. If omitted the system uses 64MB. */
    shmsize?: number,
    /** Squash the resulting images layers into a single layer. (Experimental release only.) */
    squash?: boolean,
    /** Arbitrary key/value labels to set on the image, as a JSON map of string pairs. */
    labels?: StringObject,
    /** Sets the networking mode for the run commands during build. Supported standard values are?: bridge, host, none, and container:<name|id>. Any other value is taken as a custom network's name or ID to which this container should connect to. */
    networkmode?: string,
    /** Platform in the format `os[/arch[/variant]]` */
    platform?: string,
    /** Target build stage */
    target?: string,
    /** BuildKit output configuration */
    outputs?: string,
    /** 
     * Version of the builder backend to use.
     * + 1 is the first generation classic (deprecated) builder in the Docker daemon (default)
     * + 2 is BuildKit
     * 
     * @see https://github.com/moby/buildkit
     */
    version?: "1" | "2",
    /** The tar archive contain context to build the image */
    tarPath?: string,
}

/* Delete builder cache */
export interface DeleteBuildCacheFilter {
    /** remove cache older than `<timestamp>`. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. 10m, 1h30m) computed relative to the daemon's local time. */
    until?: string,
    id?: string,
    parent?: string,
    description?: string,
    inuse?: true,
    shared?: true,
    private?: true
}

export interface DeleteBuildCacheResponse {
    CachesDeleted: string,
    /** Disk space reclaimed in bytes */
    SpaceReclaimed: number
}

/* Inspect image */
export interface InspectImage {
    /** 
     * ID is the content-addressable ID of an image.
     * 
     * This identifier is a content-addressable digest calculated from the image's configuration (which includes the digests of layers used by the image).
     * 
     * Note that this digest differs from the `RepoDigests` below, which holds digests of image manifests that reference the image.
     */
    Id: string,
    /**
     * A descriptor struct containing digest, media type, and size, as defined in the OCI Content Descriptors Specification.
     * @see https://github.com/opencontainers/image-spec/blob/v1.0.1/descriptor.md
     */
    Descriptor: ImageManifestDescriptor,
    /** 
     * Manifests is a list of image manifests available in this image. It provides a more detailed view of the platform-specific image manifests or other image-attached data like build attestations.
     * 
     * Only available if the daemon provides a multi-platform image store and the `manifests` option is set in the inspect request.
     * 
     * WARNING: This is experimental and may change at any time without any backward compatibility.
     */
    Manifest: ImageManifest[] | null,
    /** 
     * List of image names/tags in the local image cache that reference this image.
     * 
     * Multiple image tags can refer to the same image, and this list may be empty if no tags reference the image, in which case the image is "untagged", in which case it can still be referenced by its ID.
     */
    RepoTags: string[],
    /** 
     * List of content-addressable digests of locally available image manifests that the image is referenced from. Multiple manifests can refer to the same image.
     * 
     * These digests are usually only available if the image was either pulled from a registry, or if the image was pushed to a registry, which is when the manifest is generated and its digest calculated.
     */
    RepoDigests: string[],
    /** 
     * ID of the parent image.
     * 
     * Depending on how the image was created, this field may be empty and is only set for images that were built/created locally. This field is empty if the image was pulled from an image registry.
     */
    Parent: string,
    /** Optional message that was set when committing or importing the image. */
    Comment: string,
    /** 
     * Date and time at which the image was created, formatted in RFC 3339 format with nano-seconds.
     * 
     * This information is only available if present in the image, and omitted otherwise.
     * 
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    Created: string | null,
    /** 
     * The version of Docker that was used to build the image.
     *
     *Depending on how the image was created, this field may be empty.
     */
    DockerVersion: string | null | undefined,
    /** Name of the author that was specified when committing the image, or as specified through MAINTAINER (deprecated) in the Dockerfile. */
    Author: string,
    /** Configuration of the image. These fields are used as defaults when starting a container from the image. */
    Config: {
        /** The user that commands are run as inside the container. */
        User: string,
        /** An object mapping ports to an empty object. */
        ExposedPorts: ExposedPorts | null,
        /** A list of environment variables to set inside the container. */
        Env: Env[],
        /** Command to run specified as a string or an array of strings. */
        Cmd: string[],
        /** A test to perform to check that the container is healthy. */
        Healthcheck: HealthCheck,
        /** Command is already escaped (Windows only) */
        ArgsEscaped: boolean | null | undefined,
        /** An object mapping mount point paths inside the container to empty objects. */
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        Volumes: Record<string, {}>,
        /** The working directory for commands to run in. */
        WorkingDir: string,
        /** 
         * The entry point for the container as a string or an array of strings.
         * 
         * If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).
         */
        Entrypoint: string[],
        /** `ONBUILD` metadata that were defined in the image's `Dockerfile`. */
        OnBuild: string[] | null,
        /** User-defined key/value metadata. */
        Labels: StringObject,
        /** Signal to stop a container as a string or unsigned integer. */
        StopSignal: string | null,
        /** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell. */
        Shell: string[] | null
    },
    /** Hardware CPU architecture that the image runs on. */
    Architecture: string,
    /** CPU architecture variant (presently ARM-only). */
    Variant: string | null,
    /** Operating System the image is built to run on. */
    Os: string,
    /** Operating System version the image is built to run on (especially for Windows). */
    OsVersion: string | null,
    /** Total size of the image including all layers it is composed of. */
    Size: number,
    /** 
     * Total size of the image including all layers it is composed of.
     * 
     * Deprecated: this field is omitted in API v1.44, but kept for backward compatibility. Use Size instead.
     */
    VirtualSize: number,
    /** Information about the storage driver used to store the container's and image's filesystem. */
    GraphDriver: GraphDriver,
    /** Information about the image's RootFS, including the layer IDs. */
    RootFS: {
        Type: string,
        Layers: string[]
    },
    /**Additional metadata of the image in the local cache. This information is local to the daemon, and not part of the image itself.  */
    Metadata: {
        /** 
         * Date and time at which the image was last tagged in RFC 3339 format with nano-seconds.
         * 
         * This information is only available if the image was tagged locally, and omitted otherwise.
         */
        LastTagTime: string | null
    }
}

/* History */
export interface Layer {
    Id: string,
    Created: number,
    CreatedBy: string,
    Tags: string[],
    Size: number,
    Comment: string,
}

/* Delete */
export interface DeleteResponse {
    /** The image ID of an image that was untagged */
    Untagged: string,
    /** The image ID of an image that was deleted */
    Deleted: string
}

/* Search */
export interface SearchResponse {
    description: string,
    is_official: string,
    /**
     * Whether this repository has automated builds enabled.
     * @deprecated This field is deprecated and will always be "false".
     */
    is_automated: false,
    name: string,
    star_count: number,
}

export interface SearchFilter {
    "is-official": boolean,
    stars: number
}

/* Prune */
export interface PruneResponse {
    /** Images that were deleted */
    ImagesDeleted: DeleteResponse[],
    /** Disk space reclaimed in bytes */
    SpaceReclaimed: number
}

export interface PruneFilter {
    /** Prune only unused and untagged images */
    dangling: boolean,
    /** Prune images created before this timestamp */
    until: string,
    /** Prune images with (or without, in case `label!=...` is used) the specified labels. */
    label: string,
}

/* Create image from container */
export interface CreateFromContainerOption {
    /** The hostname to use for the container, as a valid RFC 1123 hostname. */
    Hostname: string,
    /** The domain name to use for the container. */
    Domainname: string,
    /** 
     * Commands run as this user inside the container. If omitted, commands run as the user specified in the image the container was started from.
     * 
     * Can be either user-name or UID, and optional group-name or GID, separated by a colon (`<user-name|UID>[<:group-name|GID>]`).
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
    /** Close `stdin` after one attached client disconnects */
    StdinOnce: boolean,
    /** A list of environment variables to set inside the container */
    Env: Env[],
    /** Command to run specified as a string or an array of strings. */
    Cmd: string[],
    /** A test to perform to check that the container is healthy. */
    Healthcheck: HealthCheck,
    /** Command is already escaped (Windows only) */
    ArgsEscaped: boolean | null,
    /** The name (or reference) of the image to use when creating the container, or which was used when the container was created. */
    Image: string,
    /** An object mapping mount point paths inside the container to empty objects. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Volumes: Record<string, {}>,
    /**The working directory for commands to run in.  */
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
     * @deprecated this field is deprecated in API v1.44 and up. Use EndpointSettings.MacAddress instead.
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

export interface CreateFromContainerResponse {
    /** The id of the newly created object. */
    Id: string
}

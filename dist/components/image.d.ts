import { type AxiosInstance } from "axios";
import type { BuildOption, CreateFromContainerOption, CreateFromContainerResponse, DeleteBuildCacheResponse, DeleteBuildCacheFilter as DeleteCacheFilters, DeleteImageResponse, InspectImage, ImageLayer, ListFilter, ImageSummary, PruneImageFilter, PruneImageResponse, ImageSearchFilter, ImageSearchResponse, RegistryImage } from "../../typing/image";
import type { StringObject } from "../../typing/global";
import type { AuthConfig } from "../../typing/client";
export declare class Image {
    private api;
    private authConfig?;
    private readonly AuthConfigString?;
    constructor(api: AxiosInstance, authConfig?: AuthConfig | undefined);
    /**
     * Returns a list of images on the server. Note that it uses a different, smaller representation of an image than inspecting a single image.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageList
     */
    list(options?: {
        /** Show all images. Only images from a final layer (no children) are shown by default. */
        all?: boolean;
        /** A JSON encoded value of the filters to process on the images list. */
        filters?: ListFilter;
        /** Compute and show shared size as a `SharedSize` field on each image. */
        "shared-size"?: boolean;
        /** Show digest information as a `RepoDigests` field on each image. */
        digests?: boolean;
        /** Include `Manifests` in the image summary. */
        manifests?: boolean;
    }): Promise<ImageSummary[]>;
    /**
     * Build an image from a tar archive with a Dockerfile in it.
     *
     * The Dockerfile specifies how the image is built from the tar archive. It is typically in the archive's root, but can be at a different path or have a different name by specifying the dockerfile parameter. See the Dockerfile reference for more information.
     *
     * The Docker daemon performs a preliminary validation of the Dockerfile before starting the build, and returns an error if the syntax is incorrect. After that, each instruction is run one-by-one until the ID of the new image is output.
     *
     * The build is canceled if the client drops the connection by quitting or being killed.
     *
     * @param extendAuthConfig Auth configurations for multiple registries that a build may refer to.
     *
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageBuild
     */
    build(options: BuildOption, 
    /** Only the registry domain name (and port if not the default 443) are required. However, for legacy reasons, the Docker Hub registry must be specified with both a https:// prefix and a /v1/ suffix even though Docker will prefer to use the v2 registry API. */
    extendAuthConfig?: {
        [serveraddress: string]: {
            username: string;
            password: string;
        };
    }): Promise<void>;
    /**
     * Delete builder cache
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/BuildPrune
     */
    deleteBuildCache(options?: {
        /**
         *  Amount of disk space in bytes to keep for cache
         * @deprecated This parameter is deprecated and has been renamed to `reserved-space`. It is kept for backward compatibility and will be removed in API v1.49.
         */
        "keep-storage"?: undefined;
        /** Amount of disk space in bytes to keep for cache */
        "reserved-space"?: number;
        /** Maximum amount of disk space allowed to keep for cache */
        "max-used-space"?: number;
        /** Target amount of free disk space after pruning */
        "min-free-space"?: number;
        /** Remove all types of build cache */
        all?: boolean;
        filters?: DeleteCacheFilters;
    }): Promise<DeleteBuildCacheResponse>;
    /**
     * Pull or import an image.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageCreate
     */
    create(options?: {
        /**
         * Name of the image to pull. If the name includes a tag or digest, specific behavior applies:
         * + If only `fromImage` includes a tag, that tag is used.
         * + If both `fromImage` and `tag` are provided, `tag` takes precedence.
         * + If `fromImage` includes a digest, the image is pulled by digest, and `tag` is ignored.
         * + If neither a tag nor digest is specified, all tags are pulled.
         */
        fromImage?: string;
        /** Source to import. The value may be a URL from which the image can be retrieved or `-` to read the image from the request body. This parameter may only be used when importing an image. */
        fromSrc?: string;
        /** Repository name given to an image when it is imported. The repo may include a tag. This parameter may only be used when importing an image. */
        repo?: string;
        /** Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled. */
        tag?: string;
        /** Set commit message for imported image. */
        message?: string;
        /**
         * Apply `Dockerfile` instructions to the image that is created, for example: `changes=ENV DEBUG=true`. Note that `ENV DEBUG=true` should be URI component encoded.
         *
         * Supported Dockerfile instructions: `CMD` `ENTRYPOINT` `ENV` `EXPOSE` `ONBUILD` `USER` `VOLUME` `WORKDIR`
         */
        changes?: string[];
        /**
         * Platform in the format `os[/arch[/variant]]`.
         *
         * When used in combination with the `fromImage` option, the daemon checks if the given image is present in the local image cache with the given OS and Architecture, and otherwise attempts to pull the image. If the option is not set, the host's native OS and Architecture are used. If the given image does not exist in the local image cache, the daemon attempts to pull the image with the host's native OS and Architecture. If the given image does exists in the local image cache, but its OS or architecture does not match, a warning is produced.
         *
         * When used with the `fromSrc` option to import an image from an archive, this option sets the platform information for the imported image. If the option is not set, the host's native OS and Architecture are used for the imported image.
         */
        platform?: string;
        /** Image content if the value `-` has been specified in fromSrc query parameter */
        content?: string;
    }): Promise<void>;
    /**
     * Return low-level information about an image.
     * @param id Image name or id
     * @param manifests Include Manifests in the image summary.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageInspect
     */
    inspect(id: string, manifests?: boolean): Promise<InspectImage>;
    /**
     * Return parent layers of an image.
     * @param id Image name or ID
     * @param platform JSON-encoded OCI platform to select the platform-variant.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageHistory
     */
    history(id: string, 
    /**
     * JSON-encoded OCI platform to select the platform-variant. If omitted, it defaults to any locally available platform, prioritizing the daemon's host platform.
     *
     * If the daemon provides a multi-platform image store, this selects the platform-variant to show the history for. If the image is a single-platform image, or if the multi-platform image does not provide a variant matching the given platform, an error is returned.
     *
     * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
     */
    platform?: Record<string, string>): Promise<ImageLayer[]>;
    /**
     * Push an image to a registry.
     *
     * If you wish to push an image on to a private registry, that image must already have a tag which references the registry. For example, `registry.example.com/myimage:latest`.
     *
     * The push is cancelled if the HTTP connection is closed.
     *
     * @param name Name of the image to push.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImagePush
     */
    push(
    /**
     * Name of the image to push. For example, `registry.example.com/myimage`. The image must be present in the local image store with the same name.
     *
     * The name should be provided without tag; if a tag is provided, it is ignored. For example, `registry.example.com/myimage:latest` is considered equivalent to `registry.example.com/myimage`.
     *
     * Use the `tag` parameter to specify the tag to push.
     */
    name: string, options?: {
        /** Tag of the image to push. For example, `latest`. If no tag is provided, all tags of the given image that are present in the local image store are pushed. */
        tag?: string;
        /**
         * JSON-encoded OCI platform to select the platform-variant. If omitted, it defaults to any locally available platform, prioritizing the daemon's host platform.
         *
         * If the daemon provides a multi-platform image store, this selects the platform-variant to show the history for. If the image is a single-platform image, or if the multi-platform image does not provide a variant matching the given platform, an error is returned.
         *
         * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
         */
        platform?: string;
    }): Promise<void>;
    /**
     * Tag an image so that it becomes part of a repository
     * @param name Image name or ID to tag.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageTag
     */
    tag(name: string, options?: {
        /** The repository to tag in. For example, `someuser/someimage`. */
        repo?: string;
        /** The name of the new tag. */
        tag?: string;
    }): Promise<void>;
    /**
     * Remove an image, along with any untagged parent images that were referenced by that image.
     *
     * Images can't be removed if they have descendant images, are being used by a running container or are being used by a build
     *
     * @param name Image name or ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageDelete
     */
    remove(name: string, options?: {
        /** Remove the image even if it is being used by stopped containers or has other tags */
        force?: boolean;
        /** Do not delete untagged parent images */
        noprune?: boolean;
        /** Select platform-specific content to delete. Multiple values are accepted. Each platform is a OCI platform encoded as a JSON string. */
        platforms?: string[];
    }): Promise<DeleteImageResponse[]>;
    /**
     * Search for an image on Docker Hub.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageSearch
     */
    search(options: {
        /** Term to search */
        term: string;
        /** Maximum number of results to return */
        limit?: number;
        /** A JSON encoded value of the filters */
        filters?: ImageSearchFilter;
    }): Promise<ImageSearchResponse[]>;
    /**
     * Delete unused images
     * @param filters Filters to process on the prune list
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImagePrune
     */
    prune(filters?: PruneImageFilter): Promise<PruneImageResponse>;
    /**
     * Create a new image from a container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageCommit
     */
    createFromContainer(options: CreateFromContainerOption): Promise<CreateFromContainerResponse>;
    /**
     * Get a tarball containing all images and metadata for a repository.
     *
     * If `name` is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned. If `name` is an image ID, similarly only that image (and its parents) are returned, but with the exclusion of the `repositories` file in the tarball, as there were no image names referenced.
     *
     * ## Image tarball format
     *
     * An image tarball contains Content as defined in the OCI Image Layout Specification.
     *
     * Additionally, includes the manifest.json file associated with a backwards compatible docker save format.
     *
     * If the tarball defines a repository, the tarball should also include a `repositories` file at the root that contains a list of repository and tag names mapped to layer IDs.
     *
     * ```json
     * {
     *   "hello-world": {
     *     "latest": "565a9d68a73f6706862bfe8409a7f659776d4d60a8d096eb4a3cbce6999cc2a1"
     *   }
     * }
     * ```
     * @param id Image name or ID
     * @see https://github.com/opencontainers/image-spec/blob/v1.1.1/image-layout.md#content
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageGet
     */
    export(id: string, option: {
        /** Path to save tar file to */
        path: string;
        /**
         * JSON encoded OCI platform describing a platform which will be used to select a platform-specific image to be saved if the image is multi-platform. If not provided, the full multi-platform image will be saved.
         *
         * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
         */
        platform: StringObject;
    }): Promise<void>;
    /**
     * Load a set of images and tags into a repository.
     *
     * ## Image tarball format
     *
     * An image tarball contains Content as defined in the OCI Image Layout Specification.
     *
     * Additionally, includes the manifest.json file associated with a backwards compatible docker save format.
     *
     * If the tarball defines a repository, the tarball should also include a `repositories` file at the root that contains a list of repository and tag names mapped to layer IDs.
     *
     * ```json
     * {
     *   "hello-world": {
     *     "latest": "565a9d68a73f6706862bfe8409a7f659776d4d60a8d096eb4a3cbce6999cc2a1"
     *   }
     * }
     * ```
     *
     * @param path Path to tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageLoad
     */
    upload(path: string, options?: {
        /** Suppress progress details during load. */
        quiet?: boolean;
        /**
         * JSON encoded OCI platform describing a platform which will be used to select a platform-specific image to be saved if the image is multi-platform. If not provided, the full multi-platform image will be saved.
         *
         * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
         */
        platform?: StringObject;
    }): Promise<void>;
    /**
     * Return image digest and platform information by contacting the registry
     * @param name Image name or id
     */
    searchOnRegistry(name: string): Promise<RegistryImage>;
}

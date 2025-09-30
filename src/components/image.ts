import axios, { type AxiosInstance } from "axios";
import type { BuildOption, CreateFromContainerBody, CreateFromContainerOption, CreateFromContainerResponse, DeleteBuildCacheResponse, DeleteBuildCacheFilter as DeleteCacheFilters, DeleteImageResponse, InspectImage, ImageLayer, ListFilter, ImageSummary, PruneImageFilter, PruneImageResponse, ImageSearchFilter, ImageSearchResponse, CreateFromContainerParam, RegistryImage } from "../../typing/image";
import { APIError, AuthFailOrCanFindImage, BadParameter, Conflict, ContainerNotFound, ImageNotFound, InvalidRepo, MissingTarPath } from "../lib/error";
import fs from 'node:fs';
import type { StringObject } from "../../typing/global";
import { objectToQuery } from "../lib/utils";
import type { AuthConfig } from "../../typing/client";
import archiver from "archiver";

export class Image {
    private readonly AuthConfigString?: string;

    constructor(private api: AxiosInstance, private authConfig?: AuthConfig) {
        if (authConfig)
            this.AuthConfigString = JSON.stringify(authConfig);
    }

    /**
     * Returns a list of images on the server. Note that it uses a different, smaller representation of an image than inspecting a single image.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageList
     */
    public async list(options?: {
        /** Show all images. Only images from a final layer (no children) are shown by default. */
        all?: boolean,
        /** A JSON encoded value of the filters to process on the images list. */
        filters?: ListFilter,
        /** Compute and show shared size as a `SharedSize` field on each image. */
        "shared-size"?: boolean,
        /** Show digest information as a `RepoDigests` field on each image. */
        digests?: boolean,
        /** Include `Manifests` in the image summary. */
        manifests?: boolean,
    }): Promise<ImageSummary[]> {

        try {
            const response = await this.api.get<ImageSummary[]>(
                `/images/json?` + objectToQuery(options || {}, {}, ["filters"])
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

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
    public async *build(
        options: BuildOption,
        /** Only the registry domain name (and port if not the default 443) are required. However, for legacy reasons, the Docker Hub registry must be specified with both a https:// prefix and a /v1/ suffix even though Docker will prefer to use the v2 registry API. */
        extendAuthConfig?: {
            [serveraddress: string]: {
                username: string,
                password: string
            }
        }
    ): AsyncGenerator<{ stream: string }> {
        const headers: Record<string, string> = {
            "Content-Type": "application/tar",
            "Transfer-Encoding": "chunked"
        };
        if (this.authConfig || extendAuthConfig) {
            const config = extendAuthConfig || {};
            if (this.authConfig)
                config[this.authConfig.serveraddress] = {
                    username: this.authConfig.username,
                    password: this.authConfig.password,
                };
            headers["X-Registry-Config"] = Buffer.from(JSON.stringify(config)).toBase64();
        }

        try {
            const requestUrl = `/build?` + objectToQuery(options, {}, ["buildargs", "labels"]);
            let response;
            if (!options.remote) {
                if (!options.contextPath)
                    throw new MissingTarPath();
                const file = archiver('tar').directory(options.contextPath, false);
                file.finalize();
                response = await this.api.post<ReadableStream<Buffer>>(
                    requestUrl,
                    file,
                    {
                        headers,
                        timeout: 0,
                        responseType: "stream",
                    }
                );
            } else if (options.remote) {
                let file: fs.ReadStream | undefined = undefined;
                if (options.contextPath)
                    file = fs.createReadStream(options.contextPath);
                response = await this.api.post<ReadableStream<Buffer>>(
                    requestUrl,
                    file || {},
                    {
                        headers,
                        timeout: 0

                    }
                );
            } else throw new Error();
            for await (const data of response.data) {
                const lines = data.toString()
                    .split("\n")
                    .map(val => val.replace('\\n', ''))
                    .filter((val) => !!val && val != '');
                for (const line of lines)
                    try {
                        yield JSON.parse(line);
                    } catch {
                        yield { stream: line };
                    }
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                let error = "";
                if (err.response?.data)
                    for await (const message of err.response.data)
                        error += message.toString?.() || message;
                try {
                    const obj = JSON.parse(error);
                    error = obj['message'];
                } catch {
                    //
                }
                if (err.status == 400)
                    throw new BadParameter(error);
                else if (err.status == 500)
                    throw new APIError(error);
            }
            throw err;
        }
    }

    /**
     * Delete builder cache
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/BuildPrune
     */
    public async deleteBuildCache(options?: {
        /**
         *  Amount of disk space in bytes to keep for cache
         * @deprecated This parameter is deprecated and has been renamed to `reserved-space`. It is kept for backward compatibility and will be removed in API v1.49.
         */
        "keep-storage"?: undefined,
        /** Amount of disk space in bytes to keep for cache */
        "reserved-space"?: number,
        /** Maximum amount of disk space allowed to keep for cache */
        "max-used-space"?: number,
        /** Target amount of free disk space after pruning */
        "min-free-space"?: number,
        /** Remove all types of build cache */
        all?: boolean,
        filters?: DeleteCacheFilters
    }): Promise<DeleteBuildCacheResponse> {
        try {
            const response = await this.api.post<DeleteBuildCacheResponse>(
                "/build/prune?" + objectToQuery(options || {}, {}, ["filters"])
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Pull or import an image.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageCreate
     */
    public async create(
        options?: {
            /** 
             * Name of the image to pull. If the name includes a tag or digest, specific behavior applies:
             * + If only `fromImage` includes a tag, that tag is used.
             * + If both `fromImage` and `tag` are provided, `tag` takes precedence.
             * + If `fromImage` includes a digest, the image is pulled by digest, and `tag` is ignored.
             * + If neither a tag nor digest is specified, all tags are pulled.
             */
            fromImage?: string,
            /** Source to import. The value may be a URL from which the image can be retrieved or `-` to read the image from the request body. This parameter may only be used when importing an image. */
            fromSrc?: string,
            /** Repository name given to an image when it is imported. The repo may include a tag. This parameter may only be used when importing an image. */
            repo?: string,
            /** Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled. */
            tag?: string,
            /** Set commit message for imported image. */
            message?: string,
            /** 
             * Apply `Dockerfile` instructions to the image that is created, for example: `changes=ENV DEBUG=true`. Note that `ENV DEBUG=true` should be URI component encoded.
             * 
             * Supported Dockerfile instructions: `CMD` `ENTRYPOINT` `ENV` `EXPOSE` `ONBUILD` `USER` `VOLUME` `WORKDIR`
             */
            changes?: string[],
            /** 
             * Platform in the format `os[/arch[/variant]]`.
             *
             * When used in combination with the `fromImage` option, the daemon checks if the given image is present in the local image cache with the given OS and Architecture, and otherwise attempts to pull the image. If the option is not set, the host's native OS and Architecture are used. If the given image does not exist in the local image cache, the daemon attempts to pull the image with the host's native OS and Architecture. If the given image does exists in the local image cache, but its OS or architecture does not match, a warning is produced.
             * 
             * When used with the `fromSrc` option to import an image from an archive, this option sets the platform information for the imported image. If the option is not set, the host's native OS and Architecture are used for the imported image.
             */
            platform?: string,
            /** Image content if the value `-` has been specified in fromSrc query parameter */
            content?: string,
        }
    ) {
        const headers: Record<string, string> = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });

        try {
            await this.api.post(`/images/create?` + objectToQuery(options || {}), options?.content || "", { headers });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 404)
                    throw new InvalidRepo(message);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Return low-level information about an image.
     * @param id Image name or id
     * @param manifests Include Manifests in the image summary.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageInspect
     */
    public async inspect(id: string, manifests: boolean = false): Promise<InspectImage> {
        try {
            const response = await this.api.get<InspectImage>(`/images/${id}/json?manifests=${manifests}`);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 404)
                    throw new ImageNotFound(id);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Return parent layers of an image.
     * @param id Image name or ID
     * @param platform JSON-encoded OCI platform to select the platform-variant.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageHistory
     */
    public async history(
        id: string,
        /** 
         * JSON-encoded OCI platform to select the platform-variant. If omitted, it defaults to any locally available platform, prioritizing the daemon's host platform.
         * 
         * If the daemon provides a multi-platform image store, this selects the platform-variant to show the history for. If the image is a single-platform image, or if the multi-platform image does not provide a variant matching the given platform, an error is returned.
         * 
         * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
         */
        platform?: Record<string, string>
    ): Promise<ImageLayer[]> {
        try {
            const response = await this.api.get<ImageLayer[]>(
                `/images/${id}/history?` + objectToQuery({ platform })
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 404)
                    throw new ImageNotFound(id);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

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
    public async push(
        /**
         * Name of the image to push. For example, `registry.example.com/myimage`. The image must be present in the local image store with the same name.
         * 
         * The name should be provided without tag; if a tag is provided, it is ignored. For example, `registry.example.com/myimage:latest` is considered equivalent to `registry.example.com/myimage`.
         * 
         * Use the `tag` parameter to specify the tag to push.
         */
        name: string,
        options?: {
            /** Tag of the image to push. For example, `latest`. If no tag is provided, all tags of the given image that are present in the local image store are pushed. */
            tag?: string,
            /** 
             * JSON-encoded OCI platform to select the platform-variant. If omitted, it defaults to any locally available platform, prioritizing the daemon's host platform.
             * 
             * If the daemon provides a multi-platform image store, this selects the platform-variant to show the history for. If the image is a single-platform image, or if the multi-platform image does not provide a variant matching the given platform, an error is returned.
             * 
             * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
             */
            platform?: string,
        }
    ) {
        const headers: Record<string, string> = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });

        try {
            await this.api.post(
                `/images/${name}/push?` + objectToQuery(options || {}),
                {},
                {
                    timeout: 0,
                    headers
                }
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 404)
                    throw new ImageNotFound(name);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Tag an image so that it becomes part of a repository
     * @param name Image name or ID to tag.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageTag
     */
    public async tag(
        name: string,
        options?: {
            /** The repository to tag in. For example, `someuser/someimage`. */
            repo?: string,
            /** The name of the new tag. */
            tag?: string
        }
    ) {
        try {
            await this.api.post(
                `/images/${name}/push?` + objectToQuery(options || {}),
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 400)
                    throw new BadParameter(message);
                else if (err.status == 404)
                    throw new ImageNotFound(name);
                else if (err.status == 409)
                    throw new Conflict(message);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Remove an image, along with any untagged parent images that were referenced by that image.
     * 
     * Images can't be removed if they have descendant images, are being used by a running container or are being used by a build
     * 
     * @param name Image name or ID
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageDelete
     */
    public async remove(
        name: string,
        options?: {
            /** Remove the image even if it is being used by stopped containers or has other tags */
            force?: boolean,
            /** Do not delete untagged parent images */
            noprune?: boolean,
            /** Select platform-specific content to delete. Multiple values are accepted. Each platform is a OCI platform encoded as a JSON string. */
            platforms?: string[]
        }
    ): Promise<DeleteImageResponse[]> {
        try {
            const reponse = await this.api.delete<DeleteImageResponse[]>(
                `/images/${name}?` + objectToQuery(options || {}, {}, ['platforms'])
            );
            return reponse.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 404)
                    throw new ImageNotFound(name);
                else if (err.status == 409)
                    throw new Conflict(message);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Search for an image on Docker Hub.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageSearch
     */
    public async search(options: {
        /** Term to search */
        term: string,
        /** Maximum number of results to return */
        limit?: number,
        /** A JSON encoded value of the filters */
        filters?: ImageSearchFilter
    }): Promise<ImageSearchResponse[]> {
        try {
            const reponse = await this.api.delete<ImageSearchResponse[]>(
                `/images/search?` + objectToQuery(options, {}, ['filters'])
            );
            return reponse.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Delete unused images
     * @param filters Filters to process on the prune list
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImagePrune
     */
    public async prune(filters?: PruneImageFilter): Promise<PruneImageResponse> {
        try {
            const response = await this.api.post<PruneImageResponse>(
                `/images/prune?` + objectToQuery({ filters }, {}, ['filters'])
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Create a new image from a container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageCommit
     */
    public async createFromContainer(options: CreateFromContainerOption): Promise<CreateFromContainerResponse> {
        const queryParam: CreateFromContainerParam = {
            container: options.container,
            repo: options.repo,
            tag: options.tag,
            author: options.author,
            changes: options.changes,
            comment: options.comment,
            pause: options.pause
        };
        const body: CreateFromContainerBody = {
            Hostname: options.Hostname,
            Domainname: options.Domainname,
            User: options.User,
            AttachStdin: options.AttachStdin,
            AttachStdout: options.AttachStdout,
            AttachStderr: options.AttachStderr,
            ExposedPorts: options.ExposedPorts,
            Tty: options.Tty,
            OpenStdin: options.OpenStdin,
            StdinOnce: options.StdinOnce,
            Env: options.Env,
            Cmd: options.Cmd,
            Healthcheck: options.Healthcheck,
            ArgsEscaped: options.ArgsEscaped,
            Image: options.Image,
            Volumes: options.Volumes,
            WorkingDir: options.WorkingDir,
            Entrypoint: options.Entrypoint,
            NetworkDisabled: options.NetworkDisabled,
            MacAddress: undefined,
            OnBuild: options.OnBuild,
            Labels: options.Labels,
            StopSignal: options.StopSignal,
            StopTimeout: options.StopTimeout,
            Shell: options.Shell,
        };
        try {
            const response = await this.api.post<CreateFromContainerResponse>(
                `/commit?` + objectToQuery(queryParam),
                body
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 404)
                    throw new ContainerNotFound(options.container || "");
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

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
    public async export(id: string, option: {
        /** Path to save tar file to */
        path: string,
        /** 
         * JSON encoded OCI platform describing a platform which will be used to select a platform-specific image to be saved if the image is multi-platform. If not provided, the full multi-platform image will be saved. 
         *
         * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
         */
        platform: StringObject,
    }) {
        try {
            const response = await this.api.get(
                `/images/${id}/get?` + objectToQuery(option, {}, ['platform']),
                {
                    responseType: 'stream'
                }
            );
            const writeStream = fs.createWriteStream(option.path);
            response.data.pipe(writeStream);
            return new Promise<void>((resolve, reject) => {
                writeStream.once('close', resolve);
                writeStream.once('error', (error) => {
                    writeStream.close();
                    reject(error);
                });
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

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
    public async upload(path: string, options?: {
        /** Suppress progress details during load. */
        quiet?: boolean,
        /** 
         * JSON encoded OCI platform describing a platform which will be used to select a platform-specific image to be saved if the image is multi-platform. If not provided, the full multi-platform image will be saved. 
         *
         * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
         */
        platform?: StringObject
    }) {
        try {
            const readStream = fs.createReadStream(path);
            await this.api.post(
                `/images/load?` + objectToQuery(options || {}),
                readStream,
                {
                    headers: {
                        "Content-Type": "application/x-tar"
                    }
                }
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Return image digest and platform information by contacting the registry
     * @param name Image name or id
     */
    public async searchOnRegistry(name: string): Promise<RegistryImage> {
        try {
            const response = await this.api.get<RegistryImage>(`/distribution/${name}/json`);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 401)
                    throw new AuthFailOrCanFindImage(message);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }
}
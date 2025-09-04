import { AxiosError, type AxiosInstance } from "axios";
import type { BuildOption, DeleteBuildCacheResponse, DeleteBuildCacheFilter as DeleteCacheFilters, DeleteResponse, InspectImage, Layer, ListFilter, ListImage, SearchFilter, SearchResponse } from "../typing/image";
import { APIError, BadParameter, Conflict, ImageNotFound, InvalidRepo, MissingTarPath } from "../lib/error";
import fs from 'node:fs';

export class Image {
    constructor(private api: AxiosInstance) { }

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
    }): Promise<ListImage[]> {
        options ||= {};
        options.all ||= false;
        options["shared-size"] ||= false;
        options.digests ||= false;
        options.manifests ||= false;

        try {
            const response = await this.api.get<ListImage[]>(
                `/v1.51/images/json?` +
                (options.all ? `all=${options.all}&` : '') +
                (options["shared-size"] ? `shared-size=${options["shared-size"]}&` : '') +
                (options.digests ? `digests=${options.digests}&` : '') +
                (options.manifests ? `manifests=${options.manifests}&` : '') +
                (options.filters ? `filters=${JSON.stringify(options.filters)}` : '')
            );
            return response.data;
        } catch (err) {
            if (err instanceof AxiosError) {
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
     */
    public async build(options: BuildOption) {
        try {
            const requestUrl =
                `/v1.51/images/json?` +
                (options.dockerfile ? `dockerfile=${options.dockerfile}&` : '') +
                (options.t ? `t=${options.t}&` : '') +
                (options.extrahosts ? `extrahosts=${options.extrahosts}&` : '') +
                (options.remote ? `remote=${options.remote}&` : '') +
                (options.q ? `q=${options.q}&` : '') +
                (options.nocache ? `nocache=${options.nocache}&` : '') +
                (options.cachefrom ? `cachefrom=${options.cachefrom}&` : '') +
                (options.pull ? `pull=${options.pull}&` : '') +
                (options.rm ? `rm=${options.rm}&` : '') +
                (options.forcerm ? `forcerm=${options.forcerm}&` : '') +
                (options.memory ? `memory=${options.memory}&` : '') +
                (options.memswap ? `memswap=${options.memswap}&` : '') +
                (options.cpushares ? `cpushares=${options.cpushares}&` : '') +
                (options.cpusetcpus ? `cpusetcpus=${options.cpusetcpus}&` : '') +
                (options.cpuquota ? `cpuquota=${options.cpuquota}&` : '') +
                (options.buildargs ? `buildargs=${JSON.stringify(options.buildargs)}&` : '') +
                (options.shmsize ? `shmsize=${options.shmsize}&` : '') +
                (options.squash ? `squash=${options.squash}&` : '') +
                (options.labels ? `labels=${JSON.stringify(options.labels)}&` : '') +
                (options.platform ? `platform=${options.platform}&` : '') +
                (options.target ? `target=${options.target}&` : '') +
                (options.outputs ? `outputs=${options.outputs}&` : '') +
                (options.version ? `version=${options.version}` : '');
            if (!options.remote) {
                if (!options.tarPath)
                    throw new MissingTarPath();
                const file = fs.createReadStream(options.tarPath);
                await this.api.post<ListImage[]>(
                    requestUrl,
                    file,
                    {
                        headers: {
                            "Content-Type": "application/x-tar"
                        },
                        timeout: 0
                    }
                );
            } else {
                let file: fs.ReadStream | undefined = undefined;
                if (options.tarPath)
                    file = fs.createReadStream(options.tarPath);
                await this.api.post(
                    requestUrl,
                    file || {},
                    {
                        headers: {
                            "Content-Type": "application/x-tar"
                        },
                        timeout: 0

                    }
                );
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                const message = err.response?.data.message || err.message;
                if (err.status == 400)
                    throw new BadParameter(message);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    public async deleteBuildCache(options?: {
        /**
         *  Amount of disk space in bytes to keep for cache
         * @deprecated This parameter is deprecated and has been renamed to `reserved-space`. It is kept for backward compatibility and will be removed in API v1.49.
         */
        "keep-storage": undefined,
        /** Amount of disk space in bytes to keep for cache */
        "reserved-space": number,
        /** Maximum amount of disk space allowed to keep for cache */
        "max-used-space": number,
        /** Target amount of free disk space after pruning */
        "min-free-space": number,
        /** Remove all types of build cache */
        all: boolean,
        filters: DeleteCacheFilters
    }): Promise<DeleteBuildCacheResponse> {
        try {
            const response = await this.api.post<DeleteBuildCacheResponse>(
                "/v1.51/build/prune?" +
                (options?.["reserved-space"] ? `reserved-space=${options["reserved-space"]}&` : '') +
                (options?.["max-used-space"] ? `max-used-space=${options["max-used-space"]}&` : '') +
                (options?.["min-free-space"] ? `min-free-space=${options["min-free-space"]}&` : '') +
                (options?.all ? `all=${options.all}&` : '') +
                (options?.filters ? `filters=${JSON.stringify(options.filters)}` : '')
            );
            return response.data;
        } catch (err) {
            if (err instanceof AxiosError) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }

    /**
     * Pull or import an image.
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
        try {
            await this.api.post(
                `/v1.51/images/create?` +
                (options?.fromImage ? `fromImage=${options.fromImage}&` : '') +
                (options?.fromSrc ? `fromSrc=${options.fromSrc}&` : '') +
                (options?.repo ? `repo=${options.repo}&` : '') +
                (options?.tag ? `tag=${options.tag}&` : '') +
                (options?.message ? `message=${options.message}&` : '') +
                (options?.changes ? `changes=${JSON.stringify(options.changes)}&` : '') +
                (options?.platform ? `platform=${options.platform}&` : '') +
                (options?.changes ? `changes=${options.changes}` : '')
            );
        } catch (err) {
            if (err instanceof AxiosError) {
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
     */
    public async inspect(id: string, manifests: boolean = false): Promise<InspectImage> {
        try {
            const response = await this.api.get<InspectImage>(`/v1.51/images/${id}/json?manifests=${manifests}`);
            return response.data;
        } catch (err) {
            if (err instanceof AxiosError) {
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
    ): Promise<Layer[]> {
        try {
            const response = await this.api.get<Layer[]>(
                `/v1.51/images/${id}/history?` +
                `platform=${JSON.stringify(platform)}`
            );
            return response.data;
        } catch (err) {
            if (err instanceof AxiosError) {
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
        try {
            await this.api.post(
                `/v1.51/images/${name}/push?` +
                (options?.tag ? `tag=${options.tag}&` : "") +
                (options?.platform ? `platform=${options.platform}` : ""),
                {},
                {
                    timeout: 0
                }
            );
        } catch (err) {
            if (err instanceof AxiosError) {
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
                `/v1.51/images/${name}/push?` +
                (options?.tag ? `tag=${options.tag}&` : "") +
                (options?.repo ? `repo=${options.repo}` : ""),
            );
        } catch (err) {
            if (err instanceof AxiosError) {
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
    ): Promise<DeleteResponse[]> {
        try {
            const reponse = await this.api.delete<DeleteResponse[]>(
                `/v1.51/images/${name}?` +
                (options?.force ? `force=${options.force}&` : "") +
                (options?.noprune ? `noprune=${options.noprune}&` : "") +
                (options?.platforms ? `platforms=${JSON.stringify(options.platforms)}` : "")
            );
            return reponse.data;
        } catch (err) {
            if (err instanceof AxiosError) {
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

    public async search(options: {
        /** Term to search */
        term: string,
        /** Maximum number of results to return */
        limit?: number,
        /** A JSON encoded value of the filters */
        filters?: SearchFilter
    }): Promise<SearchResponse[]> {
        try {
            const reponse = await this.api.delete<SearchResponse[]>(
                `/v1.51/images/search?` +
                `term=${options.term}&` +
                (options?.limit ? `limit=${options.limit}&` : "") +
                (options?.filters ? `filters=${JSON.stringify(options.filters)}` : "")
            );
            return reponse.data;
        } catch (err) {
            if (err instanceof AxiosError) {
                const message = err.response?.data.message || err.message;
                if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }
}
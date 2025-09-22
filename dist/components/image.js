import axios from "axios";
import { APIError, AuthFailOrCanFindImage, BadParameter, Conflict, ContainerNotFound, ImageNotFound, InvalidRepo, MissingTarPath } from "../lib/error";
import fs from 'node:fs';
import { objectToQuery } from "../lib/utils";
export class Image {
    api;
    authConfig;
    AuthConfigString;
    constructor(api, authConfig) {
        this.api = api;
        this.authConfig = authConfig;
        if (authConfig)
            this.AuthConfigString = JSON.stringify(authConfig);
    }
    /**
     * Returns a list of images on the server. Note that it uses a different, smaller representation of an image than inspecting a single image.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/ImageList
     */
    async list(options) {
        try {
            const response = await this.api.get(`/images/json?` + objectToQuery(options || {}, {}, ["filters"]));
            return response.data;
        }
        catch (err) {
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
    async build(options, 
    /** Only the registry domain name (and port if not the default 443) are required. However, for legacy reasons, the Docker Hub registry must be specified with both a https:// prefix and a /v1/ suffix even though Docker will prefer to use the v2 registry API. */
    extendAuthConfig) {
        const headers = {
            "Content-Type": "application/x-tar"
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
            const requestUrl = `/images/json?` + objectToQuery(options, {}, ["buildargs", "labels"]);
            if (!options.remote) {
                if (!options.tarPath)
                    throw new MissingTarPath();
                const file = fs.createReadStream(options.tarPath);
                await this.api.post(requestUrl, file, {
                    headers,
                    timeout: 0
                });
            }
            else {
                let file = undefined;
                if (options.tarPath)
                    file = fs.createReadStream(options.tarPath);
                await this.api.post(requestUrl, file || {}, {
                    headers,
                    timeout: 0
                });
            }
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || err.message;
                if (err.status == 400)
                    throw new BadParameter(message);
                else if (err.status == 500)
                    throw new APIError(message);
            }
            throw err;
        }
    }
    /**
     * Delete builder cache
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Image/operation/BuildPrune
     */
    async deleteBuildCache(options) {
        try {
            const response = await this.api.post("/build/prune?" + objectToQuery(options || {}, {}, ["filters"]));
            return response.data;
        }
        catch (err) {
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
    async create(options) {
        const headers = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });
        try {
            await this.api.post(`/images/create?` + objectToQuery(options || {}), options?.content || "", { headers });
        }
        catch (err) {
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
    async inspect(id, manifests = false) {
        try {
            const response = await this.api.get(`/images/${id}/json?manifests=${manifests}`);
            return response.data;
        }
        catch (err) {
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
    async history(id, 
    /**
     * JSON-encoded OCI platform to select the platform-variant. If omitted, it defaults to any locally available platform, prioritizing the daemon's host platform.
     *
     * If the daemon provides a multi-platform image store, this selects the platform-variant to show the history for. If the image is a single-platform image, or if the multi-platform image does not provide a variant matching the given platform, an error is returned.
     *
     * Example: `{"os": "linux", "architecture": "arm", "variant": "v5"}`
     */
    platform) {
        try {
            const response = await this.api.get(`/images/${id}/history?` + objectToQuery({ platform }));
            return response.data;
        }
        catch (err) {
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
    async push(
    /**
     * Name of the image to push. For example, `registry.example.com/myimage`. The image must be present in the local image store with the same name.
     *
     * The name should be provided without tag; if a tag is provided, it is ignored. For example, `registry.example.com/myimage:latest` is considered equivalent to `registry.example.com/myimage`.
     *
     * Use the `tag` parameter to specify the tag to push.
     */
    name, options) {
        const headers = {};
        if (this.AuthConfigString)
            headers["X-Registry-Auth"] = Buffer.from(this.AuthConfigString).toBase64({ alphabet: "base64url" });
        try {
            await this.api.post(`/images/${name}/push?` + objectToQuery(options || {}), {}, {
                timeout: 0,
                headers
            });
        }
        catch (err) {
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
    async tag(name, options) {
        try {
            await this.api.post(`/images/${name}/push?` + objectToQuery(options || {}));
        }
        catch (err) {
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
    async remove(name, options) {
        try {
            const reponse = await this.api.delete(`/images/${name}?` + objectToQuery(options || {}, {}, ['platforms']));
            return reponse.data;
        }
        catch (err) {
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
    async search(options) {
        try {
            const reponse = await this.api.delete(`/images/search?` + objectToQuery(options, {}, ['filters']));
            return reponse.data;
        }
        catch (err) {
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
    async prune(filters) {
        try {
            const response = await this.api.post(`/images/prune?` + objectToQuery({ filters }, {}, ['filters']));
            return response.data;
        }
        catch (err) {
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
    async createFromContainer(options) {
        const queryParam = {
            container: options.container,
            repo: options.repo,
            tag: options.tag,
            author: options.author,
            changes: options.changes,
            comment: options.comment,
            pause: options.pause
        };
        const body = {
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
            const response = await this.api.post(`/commit?` + objectToQuery(queryParam), body);
            return response.data;
        }
        catch (err) {
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
    async export(id, option) {
        try {
            const response = await this.api.get(`/images/${id}/get?` + objectToQuery(option, {}, ['platform']), {
                responseType: 'stream'
            });
            const writeStream = fs.createWriteStream(option.path);
            response.data.pipe(writeStream);
            return new Promise((resolve, reject) => {
                writeStream.once('close', resolve);
                writeStream.once('error', (error) => {
                    writeStream.close();
                    reject(error);
                });
            });
        }
        catch (err) {
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
    async upload(path, options) {
        try {
            const readStream = fs.createReadStream(path);
            await this.api.post(`/images/load?` + objectToQuery(options || {}), readStream, {
                headers: {
                    "Content-Type": "application/x-tar"
                }
            });
        }
        catch (err) {
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
    async searchOnRegistry(name) {
        try {
            const response = await this.api.get(`/distribution/${name}/json`);
            return response.data;
        }
        catch (err) {
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
//# sourceMappingURL=image.js.map
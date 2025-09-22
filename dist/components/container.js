import axios from "axios";
import { APIError, BadParameter, Conflict, NameIsUsed, ContainerNotFound, ContainerNotRunning, ContainerOrPathNotFound, ImageNotFound, InvalidContainerName, ReadOnlyPath } from "../lib/error";
import fs from "node:fs";
import http from "node:http";
import { objectToQuery } from "../lib/utils";
import { DockerStream } from "../lib/stream";
export class Container {
    api;
    constructor(api) {
        this.api = api;
    }
    /**
     * Returns a list of containers.
     * Note that it uses a different, smaller representation of a container than inspecting a single container.
     *
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerList
     */
    async list(options) {
        try {
            const response = await this.api.get("/containers/json?" + objectToQuery(options || {}));
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Create a container
     * @param option Container to create
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerCreate
     */
    async create(option) {
        if (option.name && !/^\/?[a-zA-Z0-9][a-zA-Z0-9_.-]+$/.test(option.name))
            throw new InvalidContainerName(option.name);
        const queryParam = {
            name: option.name,
            platform: option.platform
        };
        const body = {
            Hostname: option.Hostname,
            Domainname: option.Domainname,
            User: option.User,
            AttachStdin: option.AttachStdin,
            AttachStdout: option.AttachStdout,
            AttachStderr: option.AttachStderr,
            ExposedPorts: option.ExposedPorts,
            Tty: option.Tty,
            OpenStdin: option.OpenStdin,
            StdinOnce: option.StdinOnce,
            Env: option.Env,
            Cmd: option.Cmd,
            HealthCheck: option.HealthCheck ? {
                Test: option.HealthCheck?.Test,
                Interval: option.HealthCheck?.Interval,
                Timeout: option.HealthCheck?.Timeout,
                Retries: option.HealthCheck?.Retries,
                StartPeriod: option.HealthCheck?.StartPeriod,
                StartInterval: option.HealthCheck?.StartInterval
            } : undefined,
            ArgsEscaped: option.ArgsEscaped,
            Image: option.Image,
            Volumes: option.Volumes,
            WorkingDir: option.WorkingDir,
            Entrypoint: option.Entrypoint,
            NetworkDisabled: option.NetworkDisabled,
            MacAddress: option.MacAddress,
            OnBuild: option.OnBuild,
            Labels: option.Labels,
            StopSignal: option.StopSignal,
            StopTimeout: option.StopTimeout,
            Shell: option.Shell,
        };
        try {
            const response = await this.api.post("/containers/create?" + objectToQuery(queryParam), body);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ImageNotFound(option.Image);
                else if (error.status == 409)
                    throw new Conflict(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Return low-level information about a container.
     *
     * @param id ID or name of the container
     * @param size Return the size of container as fields `SizeRw` and `SizeRootFs`
     */
    async inspect(id, size = false) {
        try {
            const response = await this.api.get(`/containers/${id}/json?` + objectToQuery({ size }));
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * On Unix systems, this is done by running the ps command. This endpoint is not supported on Windows.
     * @param id ID or name of the container
     * @param ps_args The arguments to pass to `ps`. For example, `aux`.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerTop
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    async top(id, ps_args = "-ef") {
        try {
            const response = await this.api.get(`/containers/${id}/top?` + objectToQuery({ ps_args }));
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Returns which files in a container's filesystem have been added, deleted, or modified.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerChanges
     */
    async getFilesystemChanges(id) {
        try {
            const response = await this.api.get(`/containers/${id}/changes`);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Export the contents of a container as a tarball.
     * @param id ID or name of the container
     * @param path Where to save the tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerExport
     */
    async export(id, path) {
        try {
            const reponse = await this.api.get(`/containers/${id}/export`, { responseType: "stream" });
            const writeStream = fs.createWriteStream(path);
            reponse.data.pipe(writeStream);
            return new Promise((resolve, reject) => {
                writeStream.once('close', resolve);
                writeStream.once('error', (error) => {
                    writeStream.close();
                    reject(error);
                });
            });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Returns container’s resource usage statistics.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStats
     */
    async stats(id) {
        try {
            const response = await this.api.get(`/containers/${id}/stats`);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Start a container
     *
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStart
     */
    async start(id) {
        try {
            await this.api.post(`/containers/${id}/start`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.status == 304)
                    return;
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Stop a container
     *
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @param timeout Number of seconds to wait before killing the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStop
     */
    async stop(id, option) {
        try {
            await this.api.post(`/containers/${id}/stop?` + objectToQuery(option || {}, { "timeout": "t" }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.status == 304)
                    return;
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Restart a container
     *
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @param timeout Number of seconds to wait before killing the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRestart
     */
    async restart(id, option) {
        try {
            await this.api.post(`/containers/${id}/restart?` + objectToQuery(option || {}, { timeout: "t" }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Kill a container
     *
     * @param id ID or name of the container
     * @param signal Signal to send to the container as an integer or string (e.g. `SIGINT`)
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerKill
     */
    async kill(id, signal) {
        try {
            await this.api.post(`/containers/${id}/kill?` + objectToQuery({ signal }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new ContainerNotRunning(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Change various configuration options of a container without having to recreate it.
     * @param id ID or name of the container
     * @param option
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUpdate
     */
    async update(id, option) {
        try {
            const response = await this.api.post(`/containers/${id}/update`, option);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Rename a container
     *
     * @param id ID or name of the container
     * @param newName New name for the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRename
     */
    async rename(id, newName) {
        try {
            await this.api.post(`/containers/${id}/rename?` + objectToQuery({ name: newName }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new NameIsUsed(newName);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Use the freezer cgroup to suspend all processes in a container.
     *
     * Traditionally, when suspending a process the `SIGSTOP` signal is used, which is observable by the process being suspended. With the freezer cgroup the process is unaware, and unable to capture, that it is being suspended, and subsequently resumed.
     *
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPause
     */
    async pause(id) {
        try {
            await this.api.post(`/containers/${id}/pause`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Resume a container which has been paused.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUnpause
     */
    async unpause(id) {
        try {
            await this.api.post(`/containers/${id}/unpause`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Block until a container stops, then returns the exit code.
     * @param id ID or name of the container
     * @param condition Wait until a container state reaches the given condition.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerWait
     */
    async wait(id, condition = "not-running") {
        try {
            await this.api.post(`/containers/${id}/wait?` + objectToQuery({ condition }), {}, { timeout: 0 });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Remove a container
     * @param id ID or name of the container
     * @param volume Remove anonymous volumes associated with the container.
     * @param force If the container is running, kill it before removing it.
     * @param link Remove the specified link associated with the container.
     */
    async remove(id, option) {
        try {
            await this.api.delete(`/containers/${id}?` + objectToQuery(option || {}, { volume: "v" }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ContainerNotFound(id);
                else if (error.status == 409)
                    throw new Conflict(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Get information about files in a container
     * @param id ID or name of the container
     * @param path Resource in the container’s filesystem to archive.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchiveInfo
     */
    async pathStat(id, path) {
        try {
            const response = await this.api.head(`/containers/${id}/archive?` + objectToQuery({ path }));
            const rawData = response.headers["X-Docker-Container-Path-Stat"];
            const decodedData = Buffer.from(rawData, "base64").toString();
            return JSON.parse(decodedData);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ContainerOrPathNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Get a tar archive of a resource in the filesystem of container id.
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchive
     */
    async archive(id, option) {
        try {
            const reponse = await this.api.get(`/containers/${id}/archive?` + objectToQuery({ path: option.containerPath }), { responseType: "stream" });
            const fileWriteStream = fs.createWriteStream(option.outputPath);
            reponse.data.pipe(fileWriteStream);
            return new Promise((resolve, reject) => {
                fileWriteStream.once('close', resolve);
                fileWriteStream.once('error', (error) => {
                    fileWriteStream.close();
                    reject(error);
                });
            });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 404)
                    throw new ContainerOrPathNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Upload a tar archive to be extracted to a path in the filesystem of container id. `path` parameter is asserted to be a directory. If it exists as a file, 400 error will be returned with message "not a directory".
     * @param id ID or name of the container
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/PutContainerArchive
     */
    async upload(id, option) {
        try {
            const inputFileStream = fs.createReadStream(option.inputPath);
            await this.api.put(`/containers/${id}/archive?` + objectToQuery({ ...option }, { containerPath: 'path' }, [], ['inputPath']), inputFileStream, { headers: { "Content-Type": "application/octet-stream" } });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 400)
                    throw new BadParameter(message);
                else if (error.status == 403)
                    throw new ReadOnlyPath(message);
                else if (error.status == 404)
                    throw new ContainerOrPathNotFound(message);
                else if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Delete stopped containers
     * @param filters Filters
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPrune
     */
    async prune(filters) {
        try {
            const response = await this.api.post(`/containers/prune?` + objectToQuery({ filters }, {}, ["filters"]));
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data.message || error.message;
                if (error.status == 500)
                    throw new APIError(message);
            }
            throw error;
        }
    }
    /**
     * Attach to a container to read its output or send it input.
     * @param id ID or name of the container
     * @param option
     * @returns
     */
    async attach(id, option) {
        return new Promise((resolve, reject) => {
            const request = http.request(`${this.api.defaults.baseURL || ""}/v1.51/containers/${id}/attach?` + objectToQuery(option || {}), {
                socketPath: this.api.defaults.socketPath || undefined,
                method: "POST",
                headers: {
                    "Upgrade": "tcp",
                    "Connection": "Upgrade",
                }
            });
            request.on("upgrade", (response, socket) => {
                if (response.headers["content-type"] != "application/vnd.docker.raw-stream" &&
                    response.headers["content-type"] != "application/vnd.docker.multiplexed-stream")
                    reject("wrong upgrade :(");
                return resolve(new DockerStream(socket));
            });
            request.on("error", reject);
            request.end();
        });
    }
}
//# sourceMappingURL=container.js.map
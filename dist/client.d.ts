import type { AxiosInstance } from "axios";
import type { DockerClientOption } from "../typing/client";
import { Container } from "./components/container";
import { Image } from "./components/image";
import { Network } from "./components/network";
import { Volume } from "./components/volume";
import { Swarm } from "./components/swarm";
import { Exec } from "./components/exec";
import { Node } from "./components/node";
import { Service } from "./components/service";
import { Task } from "./components/task";
import { Secret } from "./components/secret";
import { Config } from "./components/config";
import { Plugin } from "./components/plugin";
import { System } from "./components/system";
export declare class DockerClient {
    static readonly MIN_API_VERSION = "1.24";
    static readonly API_VERSION = "1.51";
    readonly api: AxiosInstance;
    readonly containers: Container;
    readonly images: Image;
    readonly networks: Network;
    readonly volumes: Volume;
    readonly exec: Exec;
    readonly swarms: Swarm;
    readonly nodes: Node;
    readonly services: Service;
    readonly tasks: Task;
    readonly secrets: Secret;
    readonly configs: Config;
    readonly plugins: Plugin;
    readonly systems: System;
    private readonly versionRegex;
    constructor(option: DockerClientOption);
    /**
     * Create DockerClient use default docker socket path (`/var/run/docker.sock`) or, if allowed, default URL (`http://localhost:2375`)
     */
    static fromEnv(option?: {
        /** Allow using HTTP URL (not recommended). If you want to use HTTP, use DockerClient contructor instead. */
        useHttp?: boolean;
        /** API version */
        version?: string;
        /** Suppress version warning */
        suppressWarning?: boolean;
    }): Promise<DockerClient | undefined>;
    /** Check version support */
    static versionChecker(version: string, suppressWarning?: boolean): void;
}
export default DockerClient;

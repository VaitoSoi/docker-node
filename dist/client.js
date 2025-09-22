import { InvalidURL, MissingURL, NotSupportedVerssion } from "./lib/error";
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
import { lt } from "./lib/utils";
import axios from "axios";
import https from "node:https";
import fs from "node:fs";
export class DockerClient {
    static MIN_API_VERSION = "1.24";
    static API_VERSION = "1.51";
    api;
    containers;
    images;
    networks;
    volumes;
    exec;
    swarms;
    nodes;
    services;
    tasks;
    secrets;
    configs;
    plugins;
    systems;
    versionRegex = /^(.+)v[0-9.]+\/?$/;
    constructor(option) {
        let agent;
        if (option.certificate)
            agent = new https.Agent({
                cert: "cert" in option.certificate ? option.certificate.cert : fs.readFileSync(option.certificate.certPath),
                key: "key" in option.certificate ? option.certificate.key : fs.readFileSync(option.certificate.keyPath),
                passphrase: option.certificate.passphrase
            });
        if ("url" in option) {
            let url = option.url;
            if (this.versionRegex.test(url)) {
                const exec = this.versionRegex.exec(url);
                if (!exec)
                    throw new InvalidURL();
                const version = exec[1];
                if (!version)
                    throw new InvalidURL();
                DockerClient.versionChecker(version);
            }
            else
                url += (url.endsWith("/") ? "" : "/") + `v${DockerClient.API_VERSION}`;
            this.api = axios.create({ baseURL: url, httpsAgent: agent });
        }
        else if ("socketPath" in option) {
            const version = option.version;
            if (version)
                DockerClient.versionChecker(version);
            this.api = axios.create({
                baseURL: `http://localhost/v${DockerClient.API_VERSION}`,
                socketPath: option.socketPath,
                httpsAgent: agent
            });
        }
        else
            throw new MissingURL();
        this.containers = new Container(this.api);
        this.images = new Image(this.api, option.auth);
        this.networks = new Network(this.api);
        this.volumes = new Volume(this.api);
        this.swarms = new Swarm(this.api);
        this.exec = new Exec(this.api);
        this.swarms = new Swarm(this.api);
        this.nodes = new Node(this.api);
        this.services = new Service(this.api, option.auth);
        this.tasks = new Task(this.api);
        this.secrets = new Secret(this.api);
        this.configs = new Config(this.api);
        this.plugins = new Plugin(this.api, option.auth);
        this.systems = new System(this.api);
    }
    /**
     * Create DockerClient use default docker socket path (`/var/run/docker.sock`) or, if allowed, default URL (`http://localhost:2375`)
     */
    static async fromEnv(option) {
        if (option?.version)
            DockerClient.versionChecker(option?.version, option?.suppressWarning);
        try {
            await axios.get(`http://localhost/v${option?.version || DockerClient.API_VERSION}/info`, { socketPath: "/var/run/docker.sock" });
            return new DockerClient({ socketPath: "/var/run/docker.sock" });
        }
        catch (error) {
            if (!axios.isAxiosError(error))
                throw error;
        }
        if (!option?.useHttp)
            return undefined;
        try {
            await axios.get(`http://localhost:2375/v${option?.version || DockerClient.API_VERSION}/info`);
            return new DockerClient({ socketPath: "/var/run/docker.sock" });
        }
        catch (error) {
            if (!axios.isAxiosError(error))
                throw error;
        }
        return undefined;
    }
    /** Check version support */
    static versionChecker(version, suppressWarning = false) {
        if (lt(version, DockerClient.MIN_API_VERSION))
            throw new NotSupportedVerssion(version);
        if (version !== DockerClient.API_VERSION && !suppressWarning)
            console.warn(`this client is built on v${DockerClient.API_VERSION}, you provided v${version}`);
    }
}
export default DockerClient;
//# sourceMappingURL=client.js.map
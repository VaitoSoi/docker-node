import type { AxiosInstance } from "axios";
import type { InstallPluginOption, ListPluginFilter, PluginObject, PluginPrivilege } from "../../typing/plugin";
import type { AuthConfig } from "../../typing/client";
export declare class Plugin {
    private api;
    private readonly AuthConfigString?;
    constructor(api: AxiosInstance, authConfig?: AuthConfig);
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginList
     */
    list(filters: ListPluginFilter): Promise<PluginObject[]>;
    /**
     * @param remote The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/GetPluginPrivileges
     */
    privileges(remote: string): Promise<PluginPrivilege>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginPull
     */
    install(option: InstallPluginOption): Promise<void>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginInspect
     */
    inspect(name: string): Promise<PluginObject>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param force Disable the plugin before removing. This may result in issues if the plugin is in use by a container.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginDelete
     */
    remove(name: string, force?: boolean): Promise<PluginObject>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param timeout Set the HTTP client timeout (in seconds)
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginEnable
     */
    enable(name: string, timeout?: number): Promise<void>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param force Force disable a plugin even if still in use.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginDisable
     */
    disable(name: string, force?: boolean): Promise<void>;
    /**
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginUpgrade
     */
    upgrade(option: Required<InstallPluginOption>): Promise<void>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @param path The path to tar file
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginCreate
     */
    create(name: string, path: string): Promise<void>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginPush
     */
    push(name: string): Promise<void>;
    /**
     * @param name The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
     * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Plugin/operation/PluginSet
     */
    configure(name: string, body: string[]): Promise<void>;
}

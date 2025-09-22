export interface PluginDevice {
    Name: string,
    Description: string,
    Settable: string[],
    Path: string,
}

export interface PluginMount {
    Name: string,
    Description: string,
    Settable: string[],
    Destination: string,
    Type: string,
    Options: string[]
}

export interface PluginObject {
    Id: string,
    Name: string,
    /** True if the plugin is running. False if the plugin is not running, only installed. */
    Enable: boolean,
    /** Settings that can be modified by users. */
    Settings: {
        Mounts: PluginMount[],
        Env: string[],
        Args: string[],
        Devices: PluginDevice[]
    },
    PluginReference: string,
    /**  */
    Config: {
        DockerVersion: string,
        Description: string,
        Documentation: string,
        Interface: {
            Types: {
                Prefix: string,
                Capability: string,
                Version: string,
            }[],
            Socket: string,
            ProtocolScheme: "" | "moby.plugins.http/v1"
        },
        Entrypoint: string[],
        WorkDir: string,
        User: {
            UID: number,
            GID: number,
        },
        Network: {
            Type: string
        },
        Linux: {
            Capabilities: string[],
            AllowAllDevices: boolean,
            Devices: PluginDevice[]
        },
        PropagatedMount: string,
        IpcHost: boolean,
        PidHost: boolean,
        Mounts: PluginMount[],
        Env: {
            Name: string,
            Description: string,
            Settable: string[],
            Value: string,
        }[],
        Args: {
            Name: string,
            Description: string,
            Settable: string[],
            Value: string[]
        },
        rootfs: {
            type: string,
            diff_ids: string[]
        }
    }
}

/*
 * List
 */
export interface ListPluginFilter {
    capability?: string,
    enable?: boolean
}

/*
 * Privilege
 */
export interface PluginPrivilege {
    Name: string,
    Description: string,
    Value: string[]
}

/*
 * Install and Upgrade
 */
export interface InstallPluginParam {
    /** Remote reference for plugin to install. */
    remote: string,
    /** Local name for the pulled plugin. */
    name?: string
}

export interface InstallPluginOption extends InstallPluginParam {
    body: PluginPrivilege[]
}
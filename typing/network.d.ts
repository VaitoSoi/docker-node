import type { If, StringObject } from "./global";

export interface NetworkIPAM {
    /** Name of the IPAM driver to use. */
    Driver: string,
    /** List of IPAM configuration options. */
    Config: {
        Subnet: string,
        IPRange: string,
        Gateway: Storage,
        AuxiliaryAddresses: StringObject
    }[],
    /** Driver-specific options. */
    Options: StringObject
}

export interface NetworkObject<IsInspect extends boolean> {
    /** Name of the network. */
    Name: string,
    /** ID that uniquely identifies a network on a single machine. */
    Id: string,
    /**
     * Date and time at which the network was created in RFC 3339 format with nano-seconds.
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    Created: string,
    /** The level at which the network exists (e.g. `swarm` for cluster-wide or `local` for machine level) */
    Scope: string,
    /** The name of the driver used to create the network (e.g. `bridge`, `overlay`). */
    Driver: string,
    /** Whether the network was created with IPv4 enabled. */
    EnableIPv4: boolean,
    /** Whether the network was created with IPv6 enabled. */
    EnableIPv6: boolean,
    IPAM: NetworkIPAM,
    /** Whether the network is created to only allow internal networking connectivity. */
    Internal: boolean,
    /** Whether a global / swarm scope network is manually attachable by regular containers from workers in swarm mode. */
    Attachable: boolean,
    /** Whether the network is providing the routing-mesh for the swarm cluster. */
    Ingress: boolean,
    /** The config-only network source to provide the configuration for this network. */
    ConfigFrom: {
        /** The name of the config-only network that provides the network's configuration. The specified network must be an existing config-only network. Only network names are allowed, not network IDs. */
        Network: string,
    },
    /** Whether the network is a config-only network. Config-only networks are placeholder networks for network configurations to be used by other networks. Config-only networks cannot be used directly to run containers or services. */
    ConfigOnly: boolean,
    /** Contains endpoints attached to the network. */
    Containers: If<
        IsInspect,
        Record<string, {
            Name: string,
            EndpointID: string,
            MacAddress: string,
            IPv4Address: string,
            IPv6Address: string,
        }>,
        undefined
    >,
    /** Network-specific options uses when creating the network. */
    Options: StringObject,
    /** User-defined key/value metadata. */
    Labels: StringObject,
    /** List of peer nodes for an overlay network. This field is only present for overlay networks, and omitted for other network types */
    Peers: {
        /** ID of the peer-node in the Swarm cluster. */
        Name: string,
        /** IP-address of the peer-node in the Swarm cluster. */
        IP: string
    }[] | null
}

/*
 * List 
 */
export interface ListFilter {
    /** Returns all networks that are not in use by a container */
    dangling?: boolean,
    /** Matches a network's driver. */
    driver?: boolean,
    /** Matches all or part of a network ID. */
    id?: string,
    label?: string,
    /** Matches all or part of a network name. */
    name?: string,
    /** Filters networks by scope */
    scope?: string,
    /** Filters networks by type. The `custom` keyword returns all user-defined networks. */
    type?: "custom" | "builtin"
}

/*
 * Create 
 */

export interface CreateNetworkOption {
    /** Name of the network. */
    Name: string,
    /** ID that uniquely identifies a network on a single machine. */
    Id?: string,
    /**
     * Date and time at which the network was created in RFC 3339 format with nano-seconds.
     * @see https://www.ietf.org/rfc/rfc3339.txt
     */
    Created?: string,
    /** The level at which the network exists (e.g. `swarm` for cluster-wide or `local` for machine level) */
    Scope?: string,
    /** The name of the driver used to create the network (e.g. `bridge`, `overlay`). */
    Driver?: string,
    /** Whether the network was created with IPv4 enabled. */
    EnableIPv4?: boolean,
    /** Whether the network was created with IPv6 enabled. */
    EnableIPv6?: boolean,
    IPAM?: NetworkIPAM,
    /** Whether the network is created to only allow internal networking connectivity. */
    Internal?: boolean,
    /** Whether a global / swarm scope network is manually attachable by regular containers from workers in swarm mode. */
    Attachable?: boolean,
    /** Whether the network is providing the routing-mesh for the swarm cluster. */
    Ingress?: boolean,
    /** The config-only network source to provide the configuration for this network. */
    ConfigFrom?: {
        /** The name of the config-only network that provides the network's configuration. The specified network must be an existing config-only network. Only network names are allowed, not network IDs. */
        Network: string,
    },
    /** Whether the network is a config-only network. Config-only networks are placeholder networks for network configurations to be used by other networks. Config-only networks cannot be used directly to run containers or services. */
    ConfigOnly?: boolean,
    /** Network-specific options uses when creating the network. */
    Options?: StringObject,
    /** User-defined key/value metadata. */
    Labels?: StringObject,
    /** List of peer nodes for an overlay network. This field is only present for overlay networks, and omitted for other network types */
    Peers?: {
        /** ID of the peer-node in the Swarm cluster. */
        Name: string,
        /** IP-address of the peer-node in the Swarm cluster. */
        IP: string
    }[] | null
}

export interface CreateNetworkResponse {
    /** The ID of the created network. */
    Id: string,
    /** Warnings encountered when creating the container */
    Warning: string,
}

/*
 * Link
 */
export interface LinkContainerOption {
    /** The ID or name of the container to connect to the network. */
    Container: string,
    /** Configuration for a network endpoint. */
    EndpointConfig: {
        /** EndpointIPAMConfig represents an endpoint's IPAM configuration. */
        IPAMConfig: {
            IPv4Address: string,
            IPv6Address: string,
            LinkLocalIPs: string[]
        },
        Links: string[],
        /** MAC address for the endpoint on this network. The network driver might ignore this parameter. */
        MacAddress: string,
        Aliases: string[],
        /** DriverOpts is a mapping of driver options and values. These options are passed directly to the driver and are driver specific. */
        DriverOpts: StringObject | null,
        /** This property determines which endpoint will provide the default gateway for a container. The endpoint with the highest priority will be used. If multiple endpoints have the same priority, endpoints are lexicographically sorted based on their network name, and the one that sorts first is picked. */
        GwPriority: number,
        /** Unique ID of the network. */
        NetworkID: string,
        /** Unique ID for the service endpoint in a Sandbox. */
        EndpointID: string,
        /** Gateway address for this network. */
        Gateway: string,
        /** IPv4 address. */
        IPAdress: string,
        /** Mask length of the IPv4 address. */
        IPPrefixLen: number,
        /** IPv6 gateway address. */
        IPv6Gateway: string,
        /** Global IPv6 address. */
        GlobalIPv6Address: string,
        /** Mask length of the global IPv6 address. */
        GlobalIPv6PrefixLen: number,
        /** 
         * List of all DNS names an endpoint has on a specific network. This list is based on the container name, network aliases, container short ID, and hostname.
         * 
         * These DNS names are non-fully qualified but can contain several dots. You can get fully qualified DNS names by appending `.<network-name>`. For instance, if container name is `my.ctr` and the network is named `testnet`, DNSNames will contain `my.ctr` and the FQDN will be `my.ctr.testnet`.
         */
        DNSNames: string[]
    }
}

/* 
 * Prune
 */
export interface PruneFilter {
    /** Prune networks created before this timestamp */
    until: string,
    label: string,
}

export interface PruneResponse {
    NetworksDeleted: string[]
}

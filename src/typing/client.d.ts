export interface AuthConfig {
    username: string,
    password: string,
    email: string,
    /** A domain/IP without a protocol */
    serveraddress: string
}

export type DockerClientOption = ({
    /** 
     * URL linked to Docker Daemon
     * @see https://docs.docker.com/engine/daemon/remote-access
     */
    url: string,
} | {
    /** 
     * Path to Docker Unix socket.
     * It's usually `/var/run/docker.sock` 
     */
    socketPath: string,
    /** Version of API */
    version?: string,
}) & {
    auth?: AuthConfig,
    /** Suppress the warn message */
    suppressWarning?: boolean,
    certificate?: ({
        /** Cert chain in PEM format */
        cert: string,
    } | {
        /** Path to cert file */
        certPath: string,
    }) &
    ({
        /** Private keys in PEM format. */
        key: string,
    } | {
        /** Path to private key file */
        keyPath: string,
    }) & ({
        /** Shared passphrase used for a single private key and/or a PFX. */
        passphrase?: string
    })
}
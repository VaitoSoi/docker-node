# docker-node
A simple Docker Engine API wrapper

## WARNING

Because of the docs confusion, the typing may be incorrect.

If you find any mistyping object or response, [open an issue here](https://github.com/VaitoSoi/docker-node/issues/new).

# I. Introduction

This is a simple Docker Engine API wrapper, use Axios as backbone.

## II. API

### DockerClient

#### contructor(option: DockerClientOptions)

Create DockerClient instance

**Parameters:**

+ `url` string

    An URL to Docker API Engine (see https://docs.docker.com/engine/daemon/remote-access)

+ `socketPath` string 

    A path for the Docker Unix socket. It's usually `/var/run/docker.sock`.

+ `version` string

    API version.

    **Current API version:** v1.51

+ `auth` object

    + `username` string

    + `password` string

    + `email` string

    + `serveraddress` string

        A domain/IP without a protocol

+ `suppressWarning` boolean

    Suppress the version warn message

+ `certificate` object

    + `cert` string

        Cert chain in PEM format, should be accepted by NodeJS https module.

    + `certPath` string

        Path to cert file. File content should be accepted by NodeJS https module.

    + `key` string

        Private key in PEM format, should be accepted by NodeJS https module.

    + `keyPath` string

        Path to key file. File content should be accepted by NodeJS https module.

    + `passphrase` string

        Shared passphrase used for a single private key and/or a PFX.

**Note:** These options are exclusive:

+ `url` and `socketPath`, `version` 

    To specify API version using URL, put it at the end (ex: `http://localhost:2375/v1.51`)

+ `cert` and `certPath`

+ `key` and `keyPath`

#### fromEnv(options)

Create a DockerClient instance using default value (`/var/run/docker.sock` for Docker Unix socket and `http://localhost:2375` for URL).

**Parameters:**

+ `useHttp` boolean

    Allow using URL (not recommended). If you want to use URL, use DockerClient constructor instead.

+ `version` string

    API version.

    **Current API version:** v1.51

+ `suppressWarning` boolean

    Suppress version warning.

#### api

AxiosInstance, for interact with Docker Engine

#### containers

Container components

#### images

Image components

#### networks

Network components

#### volumes

Volume components

#### exec

Exec components

#### swarms

Swarm components

#### nodes

Node components

#### services

Service components

#### tasks

Task components

#### secrets

Secret components

#### configs

Config components

#### plugins

Plugin components

#### systems

System components

**Note** Each endpoint (function) in each component is documented and has a `@see` component link to the corresponding endpoint in Docker Docs. Im just too lazy to list them here again ;-;

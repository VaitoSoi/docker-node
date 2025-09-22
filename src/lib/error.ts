export class APIError extends Error { }

export class BadParameter extends Error { }

export class Conflict extends Error { }

export class PermissionDenied extends Error { }

export class NameIsUsed extends Error {
    constructor(public inputName: string) {
        super(`name ${inputName} already in use`);
    }
}

export class ContainerOrPathNotFound extends Error { }

export class ContainerNotFound extends Error {
    constructor(public id: string) {
        super(`container ${id} not found`);
    }
}

export class ContainerNotRunning extends Error {
    constructor(public id: string) {
        super(`container ${id} is not running`);
    }
}

export class ContainerIsPaused extends Error {
    constructor(public id: string) {
        super(`container ${id} is paused`);
    }
}

export class ReadOnlyPath extends PermissionDenied {
    constructor(public path: string) {
        super(`"${path}" is read-only`);
    }
}

export class ImageNotFound extends Error {
    constructor(public id: string) {
        super(`image ${id} not found`);
    }
}

export class InvalidContainerName extends Error {
    constructor(public containerName: string) {
        super(`"${containerName}" is a invalid name`);
    }
}

export class MissingTarPath extends Error { }

export class InvalidRepo extends Error { }

export class AuthFailOrCanFindImage extends Error { }

export class NetworkNotFound extends Error {
    constructor(public id: string) {
        super(`network ${id} not found`);
    }
}

export class Forbidden extends Error { }

export class PluginNotFound extends Error { }

export class NetworkOrContainerNotFound extends Error { }

export class ExecInstanceNotFound extends Error {
    constructor(public id: string) {
        super(`exec instance ${id} not found`);
    }
}

export class SwarmNotFound extends Error {
    constructor() {
        super(`swarm not found`);
    }
}

export class NotInSwarm extends Error {
    constructor() {
        super("node is not part of a swarm");
    }
}

export class AlreadyInSwarm extends Error {
    constructor() {
        super("node is alreadry part of a swarm");
    }
}

export class NodeNotFound extends Error {
    constructor(public id: string) {
        super(`node ${id} not found`);
    }
}

export class CanNotUseNetwork extends Error { }

export class ServiceNotFound extends Error {
    constructor(public id: string) {
        super(`service ${id} not found`);
    }
}

export class TaskNotFound extends Error {
    constructor(public id: string) {
        super(`task ${id} not found`);
    }
}

export class SecretNotFound extends Error {
    constructor(public id: string) {
        super(`secret ${id} not found`);
    }
}

export class ConfigNotFound extends Error {
    constructor(public id: string) {
        super(`config ${id} not found`);
    }
}

export class PluginNotInstalled extends Error {
    constructor(public id: string) {
        super(`plugin ${id} is not installed`);
    }
}

export class VolumeNotFound extends Error {
    constructor(public id: string) {
        super(`volume ${id} is not installed`);
    }
}

export class VolumeIsInUse extends Error {
    constructor(public id: string) {
        super(`volume ${id} is in use or can not be removed`);
    }
}

export class AuthError extends Error { }

export class MissingURL extends Error {
    constructor() {
        super(`missing url or socket path`);
    }
}

export class InvalidURL extends Error {
    constructor() {
        super(`input url is invalid or not contain version`);
    }
}

export class NotSupportedVerssion extends Error {
    constructor(public version: string) {
        super(`version ${version} is not supported`);
    }
}

export class InvalidInput extends Error {
    constructor() {
        super(`invalid input`);
    }
}

export class APIError extends Error {
}
export class BadParameter extends Error {
}
export class Conflict extends Error {
}
export class PermissionDenied extends Error {
}
export class NameIsUsed extends Error {
    inputName;
    constructor(inputName) {
        super(`name ${inputName} already in use`);
        this.inputName = inputName;
    }
}
export class ContainerOrPathNotFound extends Error {
}
export class ContainerNotFound extends Error {
    id;
    constructor(id) {
        super(`container ${id} not found`);
        this.id = id;
    }
}
export class ContainerNotRunning extends Error {
    id;
    constructor(id) {
        super(`container ${id} is not running`);
        this.id = id;
    }
}
export class ContainerIsPaused extends Error {
    id;
    constructor(id) {
        super(`container ${id} is paused`);
        this.id = id;
    }
}
export class ReadOnlyPath extends PermissionDenied {
    path;
    constructor(path) {
        super(`"${path}" is read-only`);
        this.path = path;
    }
}
export class ImageNotFound extends Error {
    id;
    constructor(id) {
        super(`image ${id} not found`);
        this.id = id;
    }
}
export class InvalidContainerName extends Error {
    containerName;
    constructor(containerName) {
        super(`"${containerName}" is a invalid name`);
        this.containerName = containerName;
    }
}
export class MissingTarPath extends Error {
}
export class InvalidRepo extends Error {
}
export class AuthFailOrCanFindImage extends Error {
}
export class NetworkNotFound extends Error {
    id;
    constructor(id) {
        super(`network ${id} not found`);
        this.id = id;
    }
}
export class Forbidden extends Error {
}
export class PluginNotFound extends Error {
}
export class NetworkOrContainerNotFound extends Error {
}
export class ExecInstanceNotFound extends Error {
    id;
    constructor(id) {
        super(`exec instance ${id} not found`);
        this.id = id;
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
    id;
    constructor(id) {
        super(`node ${id} not found`);
        this.id = id;
    }
}
export class CanNotUseNetwork extends Error {
}
export class ServiceNotFound extends Error {
    id;
    constructor(id) {
        super(`service ${id} not found`);
        this.id = id;
    }
}
export class TaskNotFound extends Error {
    id;
    constructor(id) {
        super(`task ${id} not found`);
        this.id = id;
    }
}
export class SecretNotFound extends Error {
    id;
    constructor(id) {
        super(`secret ${id} not found`);
        this.id = id;
    }
}
export class ConfigNotFound extends Error {
    id;
    constructor(id) {
        super(`config ${id} not found`);
        this.id = id;
    }
}
export class PluginNotInstalled extends Error {
    id;
    constructor(id) {
        super(`plugin ${id} is not installed`);
        this.id = id;
    }
}
export class VolumeNotFound extends Error {
    id;
    constructor(id) {
        super(`volume ${id} is not installed`);
        this.id = id;
    }
}
export class VolumeIsInUse extends Error {
    id;
    constructor(id) {
        super(`volume ${id} is in use or can not be removed`);
        this.id = id;
    }
}
export class AuthError extends Error {
}
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
    version;
    constructor(version) {
        super(`version ${version} is not supported`);
        this.version = version;
    }
}
export class InvalidInput extends Error {
    constructor() {
        super(`invalid input`);
    }
}
//# sourceMappingURL=error.js.map
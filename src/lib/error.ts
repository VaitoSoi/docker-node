export class APIError extends Error { }

export class BadParameter extends Error { }

export class Conflict extends Error { }

export class PermissionDenied extends Error { }

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

export class ContainerNameIsUsed extends Error {
    constructor(public containerName: string) {
        super(`name ${containerName} already in use`);
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

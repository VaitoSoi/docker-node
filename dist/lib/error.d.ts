export declare class APIError extends Error {
}
export declare class BadParameter extends Error {
}
export declare class Conflict extends Error {
}
export declare class PermissionDenied extends Error {
}
export declare class NameIsUsed extends Error {
    inputName: string;
    constructor(inputName: string);
}
export declare class ContainerOrPathNotFound extends Error {
}
export declare class ContainerNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class ContainerNotRunning extends Error {
    id: string;
    constructor(id: string);
}
export declare class ContainerIsPaused extends Error {
    id: string;
    constructor(id: string);
}
export declare class ReadOnlyPath extends PermissionDenied {
    path: string;
    constructor(path: string);
}
export declare class ImageNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class InvalidContainerName extends Error {
    containerName: string;
    constructor(containerName: string);
}
export declare class MissingTarPath extends Error {
}
export declare class InvalidRepo extends Error {
}
export declare class AuthFailOrCanFindImage extends Error {
}
export declare class NetworkNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class Forbidden extends Error {
}
export declare class PluginNotFound extends Error {
}
export declare class NetworkOrContainerNotFound extends Error {
}
export declare class ExecInstanceNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class SwarmNotFound extends Error {
    constructor();
}
export declare class NotInSwarm extends Error {
    constructor();
}
export declare class AlreadyInSwarm extends Error {
    constructor();
}
export declare class NodeNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class CanNotUseNetwork extends Error {
}
export declare class ServiceNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class TaskNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class SecretNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class ConfigNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class PluginNotInstalled extends Error {
    id: string;
    constructor(id: string);
}
export declare class VolumeNotFound extends Error {
    id: string;
    constructor(id: string);
}
export declare class VolumeIsInUse extends Error {
    id: string;
    constructor(id: string);
}
export declare class AuthError extends Error {
}
export declare class MissingURL extends Error {
    constructor();
}
export declare class InvalidURL extends Error {
    constructor();
}
export declare class NotSupportedVerssion extends Error {
    version: string;
    constructor(version: string);
}
export declare class InvalidInput extends Error {
    constructor();
}

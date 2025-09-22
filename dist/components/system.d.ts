import type { AxiosInstance } from "axios";
import type { AuthOption, AuthResponse, SystemInfo, SystemVersion, UsageResponse, MonitorOption } from "../../typing/system";
export declare class System {
    private api;
    constructor(api: AxiosInstance);
    auth(option: AuthOption): Promise<AuthResponse | undefined>;
    info(): Promise<SystemInfo>;
    version(): Promise<SystemVersion>;
    event(option?: MonitorOption): AsyncGenerator<any, void, unknown>;
    usage(): Promise<UsageResponse>;
}

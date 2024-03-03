import { environment as baseEnv } from "./environment.base";

type DevEnvironment = {} & typeof baseEnv;

export const environment: DevEnvironment = {
    ...baseEnv
};

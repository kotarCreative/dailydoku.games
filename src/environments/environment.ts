import { environment as baseEnv } from "./environment.base";

type Environment = {} & typeof baseEnv;

export const environment: Environment = {
    ...baseEnv
};

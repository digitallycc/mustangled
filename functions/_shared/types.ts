export interface EvolutionEnv {
  EVOLUTION_BASE_URL: string;
  EVOLUTION_API_KEY: string;
  EVOLUTION_INSTANCE: string;
}

export interface PagesFunctionContext<Env> {
  request: Request;
  env: Env;
}

export type PagesFunction<Env> = (
  context: PagesFunctionContext<Env>
) => Response | Promise<Response>;

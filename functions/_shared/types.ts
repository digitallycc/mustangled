export interface EvolutionEnv {
  EVOLUTION_BASE_URL: string;
  EVOLUTION_API_KEY: string;
  EVOLUTION_INSTANCE: string;
}

export interface OdooEnv {
  ODOO_BASE_URL: string;
  ODOO_API_TOKEN: string;
}

export interface AppEnv extends EvolutionEnv, OdooEnv {}

export interface PagesFunctionContext<Env> {
  request: Request;
  env: Env;
}

export type PagesFunction<Env> = (
  context: PagesFunctionContext<Env>
) => Response | Promise<Response>;

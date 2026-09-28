import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { ConfigurationError, FileNotFoundError, JsonParseError } from './exceptions';

// Utility: Environment Configuration Loader.
// Responsible for determining the active execution environment (dev, uat, staging)
// and parsing the corresponding JSON configuration file into a typed object.

export const EnvConfigSchema = z.object({
  name: z.string(),
  baseURL: z.string().url(),
  apiBaseURL: z.string().url().optional(),   // HMS Core API (port 3000)
  orchBaseURL: z.string().url().optional(),  // AWH AI Platform API (port 3001)
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

// Fetches and parses the configuration based on the ENV environment variable.
// Falls back to 'uat' if ENV is not explicitly provided.
export function getEnvConfig(): EnvConfig {
  const env = (process.env.ENV || 'uat').toLowerCase();
  const file = path.resolve(__dirname, '..', 'configs', `${env}.json`);
  if (!fs.existsSync(file)) {
    throw new FileNotFoundError(`Environment config not found: ${file} (ENV=${env})`, 'getEnvConfig');
  }
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsedJson = JSON.parse(raw);
    
    // Zod validation throws if the schema is invalid
    const config = EnvConfigSchema.parse(parsedJson);
    
    return config;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new ConfigurationError(`Invalid environment config schema in ${file}: ${error.issues.map((e: any) => e.message).join(', ')}`, 'getEnvConfig');
    }
    throw new JsonParseError(`Failed to parse environment config ${file}: ${error.message}`, 'getEnvConfig');
  }
}
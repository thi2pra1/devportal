import { createRouter, createGithubProvider } from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      github: createGithubProvider({
        authHandler: async ({
          fullProfile: {
            displayName,
            photos,
            username,
          },
        }, ctx) => {
          if (username === undefined) {
            throw new Error();
          }
          await ctx.catalogIdentityClient.findUser({
            annotations: {
              'github.com/user-login': username,
            },
          });
          let picture:string|undefined;
          if (photos !== undefined && photos[0] !== undefined) {
            picture = photos[0].value;
          }
          return {
            profile: {
              picture,
              displayName,
            }
          };
        },
      }),
    },
  });
}

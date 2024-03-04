import axios from 'axios'
import {
  DestinyManifestSlice,
  HttpClientConfig,
  getDestinyManifest,
  getDestinyManifestSlice,
} from 'bungie-api-ts/destiny2'
import logger from './logger.js'
import manifest from '../manifest.js'

export type DestinyManifestSlices = DestinyManifestSlice<
  [
    'DestinyInventoryItemDefinition',
    'DestinyPlugSetDefinition',
    'DestinySandboxPerkDefinition',
    'DestinySocketCategoryDefinition',
    'DestinySocketTypeDefinition',
    'DestinyStatGroupDefinition',
    'DestinyStatDefinition',
    'DestinyDamageTypeDefinition',
  ]
>

export async function bungieHTTPClient(config: HttpClientConfig) {
  const response = await axios(config.url, {
    params: new URLSearchParams(config.params),
    method: config.method,
    headers: {
      'X-API-Key': `${process.env.X_API_KEY}`,
    },
  }).catch((error) => {
    logger.error('Could not get manifest')
    logger.error(error)
    throw new Error(error)
  })
  return response.data
}

export default async function loadManifest(retry = 0) {
  logger.info('Trying to load manifest')
  const manifestResponse = await getDestinyManifest(bungieHTTPClient)
  if (manifestResponse.ErrorCode !== 1) {
    logger.error(manifestResponse)
    if (retry < 2) {
      logger.info('Retrying')
      return loadManifest(retry + 1)
    }
    return
  }
  const destinyManifest = manifestResponse.Response
  const path = destinyManifest.jsonWorldContentPaths.en

  if (manifest.path === path) {
    return
  }

  // Load from bungie
  const manifestDefs = await getDestinyManifestSlice(bungieHTTPClient, {
    destinyManifest,
    tableNames: [
      'DestinyInventoryItemDefinition',
      'DestinyPlugSetDefinition',
      'DestinySandboxPerkDefinition',
      'DestinySocketCategoryDefinition',
      'DestinySocketTypeDefinition',
      'DestinyStatGroupDefinition',
      'DestinyStatDefinition',
      'DestinyDamageTypeDefinition',
    ],
    language: 'en',
  })
  manifest.path = path
  manifest.definitions = manifestDefs
  logger.info('Loaded manifest')
}

import axios from 'axios'
import {
  DestinyManifestSlice,
  HttpClientConfig,
  getDestinyManifest,
  getDestinyManifestSlice,
} from 'bungie-api-ts/destiny2'
import logger from './logger.js'
import manifest from '../manifest.js'
import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

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
    return { data: { ErrorCode: 0 } }
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
    if (!manifest.path) {
      logger.info('Loading manifest from S3')
      loadManifestFromS3()
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

  if (!process.env.BUCKET_NAME || !process.env.BUCKET_REGION) {
    return
  }
  await backupManifestToS3(manifestDefs)
}

async function backupManifestToS3(manifestDefs: DestinyManifestSlices) {
  const BUCKET_NAME = process.env.BUCKET_NAME
  const BUCKET_REGION = process.env.BUCKET_REGION
  if (!BUCKET_NAME || !BUCKET_REGION) {
    logger.error('No bucket name or region for S3')
    return
  }
  const s3Client = new S3Client({ region: BUCKET_REGION })
  const command = new ListObjectsCommand({ Bucket: BUCKET_NAME })
  s3Client.send(command, async (err, data) => {
    if (err) {
      logger.error(err)
      return
    }
    if (
      (data?.Contents?.[0]?.LastModified ?? new Date(0)) <
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    ) {
      logger.info('Uploading manifest to S3')
      await uploadManifestToS3(manifestDefs)
    }
  })
}

function loadManifestFromS3() {
  const BUCKET_NAME = process.env.BUCKET_NAME
  const BUCKET_REGION = process.env.BUCKET_REGION
  if (!BUCKET_NAME || !BUCKET_REGION) {
    logger.error('No bucket name or region for S3')
    return
  }
  const s3Client = new S3Client({ region: BUCKET_REGION })
  const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: 'manifest' })
  s3Client.send(command, async (err, data) => {
    if (err) {
      logger.error(err)
      return
    }
    if (!data?.Body) {
      logger.error('No body in manifest object from S3')
      return
    }
    manifest.definitions = JSON.parse(data.Body.toString())
    logger.info('Loaded manifest from S3')
  })
}

async function uploadManifestToS3(manifest: DestinyManifestSlices) {
  const BUCKET_NAME = process.env.BUCKET_NAME
  const BUCKET_REGION = process.env.BUCKET_REGION
  if (!BUCKET_NAME || !BUCKET_REGION) {
    logger.error('No bucket name or region for S3')
    return
  }
  const s3Client = new S3Client({ region: BUCKET_REGION })
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: 'manifest',
    Body: JSON.stringify(manifest),
  })
  await s3Client.send(command, (err) => {
    if (err) {
      logger.error(err)
      return
    }
  })
  logger.info('Uploaded manifest to S3')
}

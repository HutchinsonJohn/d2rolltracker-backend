import { DestinyManifestSlices } from './utils/manifestHelpers.js'

const manifest: {
  definitions: DestinyManifestSlices | Record<string, never>
  path: string | undefined
} = { definitions: {}, path: undefined }

export default manifest

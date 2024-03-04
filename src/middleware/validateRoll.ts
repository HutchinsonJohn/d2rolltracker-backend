import { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger.js'
import {
  STAT_TYPE_MASTERWORK_TIER_TEN_HASHES,
  WEAPON_TYPE_MASTERWORK_PLUGS,
  DEFAULT_MASTERWORK_PLUGS,
} from '../data/masterworks.js'
import manifest from '../manifest.js'
import { MASTERWORK_TYPE_HASH } from '../data/sockets.js'
import getIntrinsicHashes from '../utils/intrinsics.js'

export default (req: Request, res: Response, next: NextFunction) => {
  if (manifest.definitions.DestinyInventoryItemDefinition == null) {
    return res
      .status(502)
      .send('Server Error: Could not load manifest to verify roll')
  }
  const weaponHash: number = req.body.weaponHash
  const weaponDef =
    manifest.definitions.DestinyInventoryItemDefinition[weaponHash]
  const columns: Record<number, { hash: number; index: number }[]> =
    req.body.columns
  if (weaponDef?.itemType !== 3) {
    return res.status(400).send('Invalid weapon hash')
  }
  let perkHash
  let column
  let duplicate = false
  let noPlugSet = false
  const isError = !Object.entries(columns).every(([key, value]) => {
    column = key
    const plugSetHash =
      weaponDef.sockets?.socketEntries[Number.parseInt(key, 10)]
        ?.randomizedPlugSetHash ||
      weaponDef.sockets?.socketEntries[Number.parseInt(key, 10)]
        ?.reusablePlugSetHash

    // Check for duplicate hashes
    const hashList = value.map((perk) => perk.hash)
    if (hashList.length !== new Set(hashList).size) {
      duplicate = true
      return false
    }

    const isIntrinsic =
      key === '0' &&
      manifest.definitions.DestinyInventoryItemDefinition[weaponHash].inventory
        ?.recipeItemHash != null

    const isMasterwork =
      !isIntrinsic &&
      manifest.definitions.DestinyInventoryItemDefinition[weaponHash].sockets
        ?.socketEntries[Number.parseInt(key, 10)].socketTypeHash ===
        MASTERWORK_TYPE_HASH

    if (isIntrinsic || isMasterwork) {
      let statTypeHashes = WEAPON_TYPE_MASTERWORK_PLUGS[weaponDef.itemSubType]

      if (statTypeHashes == null) {
        logger.error(`No statTypeHashes for weaponHash ${weaponHash}`)
        statTypeHashes = DEFAULT_MASTERWORK_PLUGS
      }

      const intrinsicHashes = getIntrinsicHashes(
        manifest.definitions,
        weaponHash,
        statTypeHashes,
      )

      const acceptableHashes = Object.values(
        STAT_TYPE_MASTERWORK_TIER_TEN_HASHES,
      ).concat(intrinsicHashes)
      return value.every((perk) => {
        perkHash = perk.hash
        return acceptableHashes.some((hash) => hash === perk.hash)
      })
    }

    if (plugSetHash == null) {
      noPlugSet = true
      return false
    }

    return value.every((perk) => {
      perkHash = perk.hash
      return manifest.definitions.DestinyPlugSetDefinition[
        plugSetHash
      ].reusablePlugItems.some(
        (plugItem) => plugItem.plugItemHash === perk.hash,
      )
    })
  })
  if (isError) {
    let message = `Invalid perkHash ${perkHash} at column ${column} on weaponHash ${weaponHash}`
    if (duplicate) {
      message = `Duplicate hashes at column ${column}`
    } else if (noPlugSet) {
      message = `No randomizedPlugSetHash or reusablePlugSetHash at column ${column}`
    }
    logger.info(message)
    return res.status(400).send(message)
  }
  return next()
}

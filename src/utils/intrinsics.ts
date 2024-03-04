import { DestinyManifestSlices } from './manifestHelpers'

/**
 * @returns Valid intrinsic hashes for the weapon or an empty array if there are none
 */
export default function getIntrinsicHashes(
  manifest: DestinyManifestSlices | Record<string, never>,
  weaponHash: number,
  statTypeHashes: readonly number[],
) {
  const recipeItemHash =
    manifest.DestinyInventoryItemDefinition[weaponHash].inventory
      ?.recipeItemHash
  if (recipeItemHash == null) {
    return []
  }
  const reusablePlugSetHash =
    manifest.DestinyInventoryItemDefinition[recipeItemHash].sockets
      ?.socketEntries[0].reusablePlugSetHash
  if (reusablePlugSetHash == null) {
    return []
  }
  return manifest.DestinyPlugSetDefinition[
    reusablePlugSetHash
  ].reusablePlugItems
    .map((intrinsic) => {
      const { investmentStats } =
        manifest.DestinyInventoryItemDefinition[intrinsic.plugItemHash]
      if (investmentStats.length > 0) {
        const { statTypeHash } = investmentStats[0]
        // Filters out intrinsics that are not applicable to the weapon
        if (!statTypeHashes?.includes(statTypeHash)) {
          return undefined
        }
      }
      return intrinsic.plugItemHash
    })
    .filter((intrinsic): intrinsic is number => intrinsic != null)
}

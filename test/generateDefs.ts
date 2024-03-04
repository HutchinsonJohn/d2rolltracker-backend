import manifest from '../src/manifest.js'
import loadManifest from '../src/utils/manifestHelpers.js'
import fs from 'fs'
import _ from 'lodash'

await loadManifest()

const perkColumns = [1, 2, 3, 4, 7]

const weaponHashes = [3514096004, 3055192515]

const weaponDefs = weaponHashes.map(
  (weaponHash) =>
    manifest.definitions.DestinyInventoryItemDefinition[weaponHash],
)

const plugSetHashes = _.uniq(
  weaponDefs
    .map((weaponDef) => {
      const socketEntries = weaponDef.sockets?.socketEntries
      return perkColumns.map((column) =>
        socketEntries != null
          ? socketEntries[column].randomizedPlugSetHash ||
            socketEntries[column].reusablePlugSetHash
          : undefined,
      )
    })
    .flat()
    .filter((plugSetHash): plugSetHash is number => plugSetHash != null),
)

fs.writeFile(
  'test/testDefs.ts',
  `// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  DestinyInventoryItemDefinition,
  DestinyPlugSetDefinition,
} from 'bungie-api-ts/destiny2'

${weaponDefs
  .map((def) => {
    return `export const ${def.displayProperties.name
      .replace(/'/g, '')
      .replace(/\s/g, '_')
      .toUpperCase()}_DEF: DestinyInventoryItemDefinition = ${JSON.stringify(
      def,
    )}`
  })
  .join('\n')}

export const PLUG_SET_DEFS: {
  [key: number]: DestinyPlugSetDefinition
} = {
${plugSetHashes.map((plugSetHash) => {
  return `[${plugSetHash}]: ${JSON.stringify(
    manifest.definitions.DestinyPlugSetDefinition[plugSetHash],
  )}
  `
})}
}`,
  'utf8',
  () => 'done',
)

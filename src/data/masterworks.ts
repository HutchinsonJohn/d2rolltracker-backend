import { DestinyItemSubType } from 'bungie-api-ts/destiny2'

export const STAT_TYPE = {
  Stability: 155624089,
  Range: 1240592695,
  Handling: 943549884,
  Damage: 1480404414,
  ReloadSpeed: 4188031367,
  BlastRadius: 3614673599,
  Velocity: 2523465841,
  ChargeTime: 2961396640,
  DrawTime: 447667954,
  Accuracy: 1591432999,
  ShieldDuration: 1842278586,
} as const

export const STAT_TYPE_MASTERWORK_TIER_TEN_HASHES: Readonly<
  Record<number, number | undefined>
> = {
  [STAT_TYPE.Stability]: 384158423,
  [STAT_TYPE.Range]: 2697220197,
  [STAT_TYPE.Handling]: 186337601,
  [STAT_TYPE.Damage]: 3486498337,
  [STAT_TYPE.ReloadSpeed]: 758092021,
  [STAT_TYPE.BlastRadius]: 3803457565,
  [STAT_TYPE.Velocity]: 1154004463,
  [STAT_TYPE.ChargeTime]: 3128594062,
  [STAT_TYPE.DrawTime]: 1639384016,
  [STAT_TYPE.Accuracy]: 2993547493,
  [STAT_TYPE.ShieldDuration]: 266016299,
}

export const DEFAULT_MASTERWORK_PLUGS = [
  STAT_TYPE.Stability,
  STAT_TYPE.Range,
  STAT_TYPE.Handling,
  STAT_TYPE.ReloadSpeed,
] as const
const GLAIVE_MASTERWORK_PLUGS = [
  STAT_TYPE.Range,
  STAT_TYPE.Handling,
  STAT_TYPE.ReloadSpeed,
  STAT_TYPE.ShieldDuration,
] as const
const FUSION_RIFLE_MASTERWORK_PLUGS = [
  STAT_TYPE.Stability,
  STAT_TYPE.Range,
  STAT_TYPE.Handling,
  STAT_TYPE.ReloadSpeed,
  STAT_TYPE.ChargeTime,
] as const
const ROCKET_LAUNCHER_MASTERWORK_PLUGS = [
  STAT_TYPE.Stability,
  STAT_TYPE.Handling,
  STAT_TYPE.ReloadSpeed,
  STAT_TYPE.BlastRadius,
  STAT_TYPE.Velocity,
] as const
const SWORD_MASTERWORK_PLUGS = [STAT_TYPE.Damage] as const
const BOW_MASTERWORK_PLUGS = [
  STAT_TYPE.Stability,
  STAT_TYPE.Handling,
  STAT_TYPE.ReloadSpeed,
  STAT_TYPE.DrawTime,
  STAT_TYPE.Accuracy,
] as const

export const WEAPON_TYPE_MASTERWORK_PLUGS: Readonly<
  Record<number, readonly number[] | undefined>
> = {
  [DestinyItemSubType.AutoRifle]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.Shotgun]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.Machinegun]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.HandCannon]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.RocketLauncher]: ROCKET_LAUNCHER_MASTERWORK_PLUGS,
  [DestinyItemSubType.FusionRifle]: FUSION_RIFLE_MASTERWORK_PLUGS,
  [DestinyItemSubType.SniperRifle]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.PulseRifle]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.ScoutRifle]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.Sidearm]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.Sword]: SWORD_MASTERWORK_PLUGS,
  [DestinyItemSubType.FusionRifleLine]: FUSION_RIFLE_MASTERWORK_PLUGS,
  [DestinyItemSubType.GrenadeLauncher]: ROCKET_LAUNCHER_MASTERWORK_PLUGS,
  [DestinyItemSubType.SubmachineGun]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.TraceRifle]: DEFAULT_MASTERWORK_PLUGS,
  [DestinyItemSubType.Bow]: BOW_MASTERWORK_PLUGS,
  [DestinyItemSubType.Glaive]: GLAIVE_MASTERWORK_PLUGS,
}

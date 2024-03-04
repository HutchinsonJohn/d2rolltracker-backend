import {
  FilterQuery,
  MergeType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose'
import RollModel, { Roll, RollDocument } from '../models/roll.model.js'
import { ShortUser } from '../models/user.model.js'

export async function createRoll(input: Roll) {
  return (await RollModel.create(input)).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export async function findRoll(
  query: FilterQuery<RollDocument>,
  options: QueryOptions = { lean: true },
) {
  return RollModel.findOne(query, {}, options).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export async function updateRoll(
  query: FilterQuery<RollDocument>,
  update: UpdateQuery<RollDocument>,
  options: QueryOptions = { lean: true, new: true },
) {
  return RollModel.findOneAndUpdate(query, update, options).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export async function deleteRoll(query: FilterQuery<RollDocument>) {
  return RollModel.deleteOne(query)
}

export async function deleteManyRolls(query: FilterQuery<RollDocument>) {
  return RollModel.deleteMany(query)
}

export async function findManyRolls(
  query: FilterQuery<RollDocument>,
  options: QueryOptions = { lean: true },
) {
  return RollModel.find(query, {}, options).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export function trimRollData(
  roll: MergeType<
    RollDocument,
    {
      createdBy: ShortUser
    }
  >,
) {
  const { rollId, rollName, createdBy, weaponHash, columns, createdAt } = roll

  const { bungieMembershipId, displayName, displayNameCode } = createdBy

  return {
    rollId,
    rollName,
    createdBy: { bungieMembershipId, displayName, displayNameCode },
    weaponHash,
    columns,
    createdAt,
  }
}

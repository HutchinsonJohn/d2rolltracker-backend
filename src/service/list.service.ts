import {
  FilterQuery,
  MergeType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose'
import ListModel, { List, ListDocument } from '../models/list.model.js'
import { RollDocument } from '../models/roll.model.js'
import { ShortUser } from '../models/user.model.js'
import { trimRollData } from './roll.service.js'

export async function createList(input: List) {
  return ListModel.create(input)
}

export async function findList(
  query: FilterQuery<ListDocument>,
  options: QueryOptions = { lean: true },
) {
  return ListModel.findOne(query, {}, options).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export async function updateList(
  query: FilterQuery<ListDocument>,
  update: UpdateQuery<ListDocument>,
  options: QueryOptions = { lean: true, new: true },
) {
  return ListModel.findOneAndUpdate(query, update, options).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export async function deleteList(query: FilterQuery<ListDocument>) {
  return ListModel.deleteOne(query)
}

export async function deleteManyLists(query: FilterQuery<ListDocument>) {
  return ListModel.deleteMany(query)
}

export async function findLists(
  query: FilterQuery<ListDocument>,
  options: QueryOptions = { lean: true },
) {
  return ListModel.find(query, {}, options).populate<{
    createdBy: ShortUser & {
      _id: Types.ObjectId
    }
  }>('createdBy', 'bungieMembershipId displayName displayNameCode')
}

export function trimListData(
  list: MergeType<
    ListDocument,
    {
      createdBy: ShortUser
    }
  >,
) {
  const { listName, createdBy, isPrivate, listId, subscribedUsers, createdAt } =
    list
  const { bungieMembershipId, displayName, displayNameCode } = createdBy

  return {
    listName,
    createdBy: { bungieMembershipId, displayName, displayNameCode },
    isPrivate,
    listId,
    subscribedUsers,
    createdAt,
  }
}

export function trimListsWithRolls(
  list: MergeType<
    ListDocument,
    {
      createdBy: ShortUser
      rolls: RollDocument[]
    }
  >,
) {
  const { listName, createdBy, isPrivate, listId, subscribedUsers, createdAt } =
    list
  const { bungieMembershipId, displayName, displayNameCode } = createdBy
  const rolls = list.rolls.map((roll) =>
    trimRollData({
      ...roll,
      createdBy: { bungieMembershipId, displayName, displayNameCode },
    }),
  )
  return {
    listName,
    createdBy: { bungieMembershipId, displayName, displayNameCode },
    isPrivate,
    listId,
    subscribedUsers,
    rolls,
    createdAt,
  }
}

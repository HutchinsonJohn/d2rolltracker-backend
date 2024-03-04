import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import UserModel, { User, UserDocument } from '../models/user.model.js'

export async function createUser(input: User) {
  return UserModel.create(input)
}

export async function findUser(query: FilterQuery<User>) {
  return UserModel.findOne(query)
}

export async function updateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions,
) {
  return UserModel.findOneAndUpdate(query, update, options)
}

export async function deleteUser(query: FilterQuery<UserDocument>) {
  return UserModel.deleteOne(query)
}

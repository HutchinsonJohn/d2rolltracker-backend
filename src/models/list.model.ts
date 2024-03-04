import mongoose, { Types } from 'mongoose'
import { nanoid } from 'nanoid'
const { model, Schema } = mongoose

export interface List {
  listName: string
  createdBy: Types.ObjectId
  isPrivate: boolean
}

export interface ListDocument extends List {
  listId: string
  subscribedUsers: Types.ObjectId[]
  rolls: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const listSchema = new Schema(
  {
    listId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(12),
    },
    listName: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPrivate: { type: Boolean, required: true },
    subscribedUsers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      default: () => [],
    },
    rolls: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Roll' }],
      required: true,
      default: () => [],
    },
  },
  {
    timestamps: true,
  },
)

const ListModel = model<ListDocument>('List', listSchema)

export default ListModel

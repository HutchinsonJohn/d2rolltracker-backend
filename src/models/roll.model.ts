import mongoose, { Types } from 'mongoose'
import { nanoid } from 'nanoid'
const { model, Schema } = mongoose

export interface Roll {
  rollId: string
  rollName: string
  createdBy: Types.ObjectId
  list: Types.ObjectId
  weaponHash: number
  columns: Record<
    number,
    {
      hash: number
      index: number
    }[]
  >
}

export interface RollDocument extends Roll {
  createdAt: Date
  updatedAt: Date
}

const columnSchema = new Schema(
  {
    hash: { type: Number, required: true },
    index: { type: Number, required: true },
  },
  { _id: false },
)

const rollSchema = new Schema(
  {
    rollId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(12),
    },
    rollName: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    list: { type: Schema.Types.ObjectId, ref: 'List', required: true },
    weaponHash: { type: Number, required: true },
    columns: {
      type: Map,
      of: [columnSchema],
      required: true,
      _id: false,
    },
  },
  {
    timestamps: true,
  },
)

const RollModel = model<RollDocument>('Roll', rollSchema)

export default RollModel

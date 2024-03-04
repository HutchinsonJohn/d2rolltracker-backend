import mongoose, { Types } from 'mongoose'
const { model, Schema } = mongoose

export interface Session {
  user: Types.ObjectId
  isValid: boolean
  userAgent: string
}

export interface SessionDocument extends Session {
  createdAt: Date
  updatedAt: Date
}

const sessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    isValid: { type: Boolean, default: true },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  },
)

const SessionModel = model<SessionDocument>('Session', sessionSchema)

export default SessionModel

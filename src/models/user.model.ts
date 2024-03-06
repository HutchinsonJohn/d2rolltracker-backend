import mongoose, { Types } from 'mongoose'
const { model, Schema } = mongoose

export interface DestinyMembershipDetails {
  membershipType: number
  membershipId: string
  displayName: string
  displayNameCode: number | undefined
  iconPath: string
}

const DestinyMembershipDetails = {
  membershipType: Number,
  membershipId: String,
  displayName: String,
  displayNameCode: Number,
  iconPath: String,
}

export interface ShortUser {
  bungieMembershipId: string
  displayName: string
  displayNameCode: number | undefined
}

export interface User extends ShortUser {
  profilePicturePath: string
  defaultDestinyMembershipType: number
  defaultDestinyMembershipId: string
  destinyMembershipsDetails: DestinyMembershipDetails[]
}

export interface UserDocument extends User {
  privateList: Types.ObjectId
  publicLists: Types.ObjectId[]
  subscribedLists: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema(
  {
    bungieMembershipId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    displayNameCode: { type: Number },
    profilePicturePath: { type: String },
    defaultDestinyMembershipType: { type: Number, required: true },
    defaultDestinyMembershipId: { type: String, required: true },
    destinyMembershipsDetails: {
      type: [DestinyMembershipDetails],
      required: true,
    },
    privateList: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      // Instantiated without a list, will be immediately added
    },
    publicLists: {
      type: [{ type: Schema.Types.ObjectId, ref: 'List' }],
      required: true,
      default: () => [],
    },
    subscribedLists: {
      type: [{ type: Schema.Types.ObjectId, ref: 'List' }],
      required: true,
      default: () => [],
    },
  },
  {
    timestamps: true,
  },
)

const UserModel = model<UserDocument>('User', userSchema)

export default UserModel

import { object, string } from 'zod'

export const createSessionSchema = object({
  body: object({
    code: string({
      required_error: 'Bungie response code required',
    }),
  }),
})

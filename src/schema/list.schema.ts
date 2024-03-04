import { boolean, object, string } from 'zod'
import Filter from 'bad-words'

const filter = new Filter()
filter.removeWords('God')

const payload = {
  body: object({
    listName: string().refine((val) => !filter.isProfane(val), {
      message: 'List name cannot contain profanity',
    }),
    isPrivate: boolean({
      required_error: 'isPrivate is required',
    }),
  }),
}

const params = {
  params: object({
    listId: string({
      required_error: '_id is required',
    }),
  }),
}

export const createListSchema = object({
  ...payload,
})

export const updateListSchema = object({
  ...payload,
  ...params,
})

export const deleteListSchema = object({
  ...params,
})

export const getListSchema = object({
  ...params,
})

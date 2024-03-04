import { array, number, object, record, string } from 'zod'
import Filter from 'bad-words'

const filter = new Filter()
filter.removeWords('God')

const payload = {
  body: object({
    rollName: string({ required_error: 'Roll Name is required' })
      .trim()
      .min(3, { message: 'Roll name must be longer than 2 characters' })
      .max(99, { message: 'Roll name must be shorter than 100 characters' })
      .refine((val) => !filter.isProfane(val), {
        message: 'Roll name cannot contain profanity',
      }),
    listId: string({ required_error: 'List ID is required' }),
    weaponHash: number({
      required_error: 'Weapon hash is required',
    }).int(),
    columns: record(
      string(),
      array(
        object({
          hash: number({
            required_error: 'Perk hash is required for each perk',
          }).int(),
          index: number({ required_error: 'Index is required for each perk' })
            .int()
            .nonnegative()
            .lt(128, { message: 'Index must be less than 128' }),
        }),
        { required_error: 'Perk column is required' },
      ),
      { required_error: 'Perk columns are required' },
    ).refine(
      (columns) => Object.values(columns).some((column) => column.length > 0),
      {
        message: 'Please add at least one perk to the roll',
      },
    ),
  }),
}

const params = {
  params: object({
    rollId: string({
      required_error: '_id is required',
    }),
  }),
}

export const createRollSchema = object({
  ...payload,
})

export const updateRollSchema = object({
  ...payload,
  ...params,
})

export const deleteRollSchema = object({
  ...params,
})

export const getRollSchema = object({
  ...params,
})

import { Request, Response } from 'express'
import { findList, updateList } from '../service/list.service.js'
import {
  createRoll,
  deleteRoll,
  findRoll,
  trimRollData,
  updateRoll,
} from '../service/roll.service.js'

export async function createRollHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  const { listId, ...body } = req.body

  const list = await findList({ listId })
  if (list == null || !list.createdBy._id.equals(userId)) {
    return res.status(403).send('List does not exist or belong to user')
  }

  const roll = await createRoll({
    ...body,
    list: list._id,
    createdBy: userId,
  })

  await updateList({ listId }, { $push: { rolls: roll._id } })

  return res.send(trimRollData(roll))
}

export async function updateRollHandler(req: Request, res: Response) {
  const user_id = res.locals.user._id

  const rollId = req.params.rollId
  const update = req.body

  const roll = await findRoll({ rollId })

  if (!roll) {
    return res
      .status(404)
      .send(
        'The roll being updated does not exist. Please create a new roll instead.',
      )
  }

  if (!roll.createdBy._id.equals(user_id)) {
    return res
      .status(403)
      .send('You do not have permission to update this roll.')
  }

  if (update.weaponHash !== roll.weaponHash) {
    return res.status(400).send('You cannot change the weapon of a roll.')
  }

  const list = await findList({ listId: update.listId })
  if (list == null) {
    return res.status(404).send('List does not exist')
  }

  if (!list?._id.equals(roll.list)) {
    if (!list?.createdBy._id.equals(user_id)) {
      return res
        .status(403)
        .send('You do not have permission to update this list.')
    }
    await updateList({ _id: roll.list }, { $pull: { rolls: roll._id } })
    await updateList({ _id: list._id }, { $push: { rolls: roll._id } })
  }

  const updatedRoll = await updateRoll({ rollId }, update)

  if (updatedRoll == null) {
    return res
      .status(500)
      .send('There was an error updating the roll. Please refresh the page.')
  }

  return res.send(trimRollData(updatedRoll))
}

export async function getRollHandler(req: Request, res: Response) {
  const rollId = req.params.rollId

  const roll = await findRoll({ rollId })

  if (!roll) {
    return res
      .status(404)
      .send(
        'Roll does not exist.  It may have been deleted or it may have never existed.',
      )
  }

  return res.send(trimRollData(roll))
}

export async function deleteRollHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  const rollId = req.params.rollId

  const roll = await findRoll({ rollId })

  if (!roll) {
    return res.status(404).send('Roll does not exist')
  }

  if (!roll.createdBy._id.equals(userId)) {
    return res
      .status(403)
      .send('You do not have permission to delete this roll')
  }

  const list_id = roll.list

  const list = await findList({ _id: list_id })
  if (list == null || !list.createdBy._id.equals(userId)) {
    return res.status(403).send('List does not exist or belong to user')
  }

  await updateList({ _id: list_id }, { $pull: { rolls: roll._id } })

  await deleteRoll({ rollId })

  return res.sendStatus(200)
}

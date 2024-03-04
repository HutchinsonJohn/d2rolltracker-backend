import { Request, Response } from 'express'
import {
  createList,
  deleteList,
  findList,
  findLists,
  updateList,
  trimListData,
} from '../service/list.service.js'

export async function createListHandler(req: Request, res: Response) {
  const user = res.locals.user

  if (user.publicLists.length >= 3) {
    return res.status(403).send('User already has 3 public lists')
  }

  const body = req.body

  const list = await createList({ ...body, createdBy: user._id })

  return res.send(list)
}

export async function updateListHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  const listId = req.params.listId
  const update = req.body

  const list = await findList({ listId })

  if (!list) {
    return res.sendStatus(404)
  }

  if (!list.createdBy._id.equals(userId) || list.isPrivate) {
    return res.sendStatus(403)
  }

  const updatedList = await updateList({ listId }, update)

  if (updatedList == null) {
    return res
      .status(500)
      .send('There was an error updating the list. Please refresh the page.')
  }

  return res.send(trimListData(updatedList))
}

export async function getListHandler(req: Request, res: Response) {
  const userId = res.locals.user?._id

  const listId = req.params.listId

  const list = await findList({ listId })

  if (!list) {
    return res.sendStatus(404)
  }

  if (!list.createdBy._id.equals(userId) && list.isPrivate) {
    return res.sendStatus(403)
  }

  return res.send(trimListData(list))
}

export async function deleteListHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  const listId = req.params.listId

  const list = await findList({ listId })

  if (!list) {
    return res.sendStatus(404)
  }

  if (!list.createdBy._id.equals(userId) || list.isPrivate) {
    return res.sendStatus(403)
  }

  await deleteList({ rollId: listId })

  return res.sendStatus(200)
}

export async function getUserCreatedListsHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  const lists = await findLists({ createdBy: userId })
  if (lists.length < 1) {
    return res.sendStatus(404)
  }

  return res.send(lists.map(trimListData))
}

export async function getListsHandler(req: Request, res: Response) {
  const skip = +req.params.skip
  const sort = req.params.sort

  // TODO: Get with rolls populated
  const lists = await findLists(
    { isPrivate: false },
    { lean: true, sort: {}, skip },
  )

  return res.send(lists.map(trimListData))
}

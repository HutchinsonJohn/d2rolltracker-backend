import { Request, Response } from 'express'
import { deleteManyRolls, findManyRolls } from '../service/roll.service.js'
import { deleteManyLists } from '../service/list.service.js'
import { deleteUser } from '../service/user.service.js'

export async function deleteUserHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  await deleteManyRolls({ createdBy: userId })
  await deleteManyLists({ createdBy: userId })
  await deleteUser({ _id: userId })

  return res.send('User deleted')
}

export async function getUserGodRollsForWeapon(req: Request, res: Response) {
  const userId = res.locals.user._id
  const weaponHash = +req.params.weaponHash

  const rolls = await findManyRolls({
    weaponHash,
    $or: [
      { createdBy: userId },
      // This line is incorrect, but it's not necessary to fix until list sharing is implemented
      // { listId: { $in: res.locals.user.subscribedLists } }
    ],
  })
  return res.send(rolls)
}

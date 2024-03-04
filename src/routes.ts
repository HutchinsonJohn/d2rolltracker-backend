import { Express, Request, Response } from 'express'
import {
  createListHandler,
  deleteListHandler,
  getListHandler,
  getListsHandler,
  getUserCreatedListsHandler,
  updateListHandler,
} from './controller/list.controller.js'
import {
  createRollHandler,
  deleteRollHandler,
  getRollHandler,
  updateRollHandler,
} from './controller/roll.controller.js'
import {
  createSessionHandler,
  deleteSessionHandler,
  refreshTokenHandler,
} from './controller/session.controller.js'
import {
  deleteUserHandler,
  getUserGodRollsForWeapon,
} from './controller/user.controller.js'
import requireUser from './middleware/requireUser.js'
import validateResource from './middleware/validateResource.js'
import {
  createListSchema,
  deleteListSchema,
  getListSchema,
  updateListSchema,
} from './schema/list.schema.js'
import {
  createRollSchema,
  deleteRollSchema,
  getRollSchema,
  updateRollSchema,
} from './schema/roll.schema.js'
import { createSessionSchema } from './schema/session.schema.js'
import validateRoll from './middleware/validateRoll.js'

export default function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  // Sessions
  app.post(
    '/sessions',
    validateResource(createSessionSchema),
    createSessionHandler,
  )
  app.delete('/sessions', requireUser, deleteSessionHandler)

  // Refresh token
  app.post('/tokens', refreshTokenHandler)

  // Delete user account route
  app.delete('/users', requireUser, deleteUserHandler)

  // Rolls
  app.post(
    '/rolls',
    [requireUser, validateResource(createRollSchema), validateRoll],
    createRollHandler,
  )
  app.put(
    '/rolls/:rollId',
    [requireUser, validateResource(updateRollSchema), validateRoll],
    updateRollHandler,
  )
  app.get('/rolls/:rollId', [validateResource(getRollSchema)], getRollHandler)
  app.delete(
    '/rolls/:rollId',
    [requireUser, validateResource(deleteRollSchema)],
    deleteRollHandler,
  )

  // Lists
  // app.post(
  //   '/lists',
  //   [requireUser, validateResource(createListSchema)],
  //   createListHandler,
  // )
  // app.put(
  //   '/lists/:listId',
  //   [requireUser, validateResource(updateListSchema)],
  //   updateListHandler,
  // )
  app.get('/lists/:listId', [validateResource(getListSchema)], getListHandler)
  // app.get('/lists', getListsHandler)
  // app.delete(
  //   '/lists/:listId',
  //   [requireUser, validateResource(deleteListSchema)],
  //   deleteListHandler,
  // )

  // TODO: change route
  // User's created lists
  app.get('/user/lists', requireUser, getUserCreatedListsHandler)

  // TODO: implement
  // User's subscribed lists (including created)

  // User's rolls for specified weapon
  app.get(
    '/user/weapons/:weaponHash/rolls',
    requireUser,
    getUserGodRollsForWeapon,
  )
}

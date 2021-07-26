'use strict'

/*
  The @serverless/cloud package is included by default in the cloud runtime.
  So you don't have to include it in package.json.
  
  Use 'api' to build REST APIs, 'data' to access Serverless Data, and 'schedule'
  to create scheduled tasks.

  If you want to serve up static assets, just put them in the '/static' folder
*/
const { api, data, schedule } = require('@serverless/cloud') // eslint-disable-line
const services = require('./services.json')
const dayjs = require('dayjs')

// Get service by ID
api.get('/services/:id', async (req, res) => {
  const service = await data.get(`service:${req.params.id}`)
  res.json(service)
})

// Create a battle between two services
api.get('/battle', async (req, res) => {
  let max = services.length - 1

  let firstServiceId = Math.floor(Math.random() * max) + 1
  let secondServiceId = Math.floor(Math.random() * max) + 1

  if (secondServiceId === firstServiceId) secondServiceId = Math.floor(Math.random() * max) + 1

  const firstService = await data.get(`service:${firstServiceId}`)
  const secondService = await data.get(`service:${secondServiceId}`)

  delete firstService.score, firstService.wins, firstService.losses
  delete secondService.score, secondService.wins, secondService.losses

  res.json({
    data: [firstService, secondService]
  })
})

api.post('/battle', async (req, res) => {
  try {
    const winner = await data.get(`service:${req.body.winner}`)
    const loser = await data.get(`service:${req.body.loser}`)

    const winnerExpected = expectedScore(loser.score, winner.score)
    const winnerNewScore = winnerScore(winner.score, winnerExpected)

    const loserExpected = expectedScore(winner.score, loser.score)
    const loserNewScore = loserScore(loser.score, loserExpected)

    winner.score = winnerNewScore
    winner.wins = Number(winner.wins) + 1

    loser.score = loserNewScore
    loser.losses = Number(loser.losses) + 1

    const updateWinner = data.set(`service:${winner.id}`, winner, generateLabelsFromService(winner))
    const updateLoser = data.set(`service:${loser.id}`, loser, generateLabelsFromService(loser))

    const battle = {
      winner: winner.id,
      loser: loser.id,
      ip: req.ip,
      created_at: dayjs().toISOString()
    }

    battle.id = `${battle.created_at}-${Math.floor(Math.random() * 999)}`

    const createBattle = data.set(`battle:${battle.id}`, battle, generateLabelsFromBattle)

    Promise.all([
      updateWinner,
      updateLoser,
      createBattle
    ]).then((values) => {
      console.log(values)

      res.json({ status: true })
    })
  } catch (e) {
    console.error(e)
  }
})

function generateLabelsFromService (service) {
  return {
    label1: service.vendor,
    label2: String(service.score),
    label3: String(service.wins),
    label4: String(service.losses)
  }
}

function generateLabelsFromBattle (battle) {
  return {
    label1: battle.created_at,
    label2: String(battle.winner),
    label3: String(battle.loser),
    label4: String(battle.id)
  }
}

/*
 * Create a route to GET our TODO items
*/
api.get('/todos', async (req, res) => {

  // Call our getTodos function with the status
  let result = await getTodos(req.query.status, req.query.meta ? true : {})

  // Return the results
  res.send({
    items: result.items
  })
})

/* 
 * Create a route to POST updates to a TODO item
*/
api.post('/todos/:id', async (req, res) => {

  console.log(new Date().toISOString())

  let body = req.body

  if (body.duedate) { body.duedate = new Date(body.duedate).toISOString()}

  await data.set(
    `todo:${req.params.id}`,
    body,
    Object.assign({},
      req.body.status ?
        {
          label1: body.status === 'complete' ?
            `complete:${new Date().toISOString()}`
            : `incomplete:${body.duedate ? body.duedate : '9999'}`
        }
        : null
    )
  )

  // Query all the TODOs again
  let result = await getTodos(req.query.status)

  // Return the updated list of TODOs
  res.send({
    items: result.items
  })
})

/* 
 * Create a route to DELETE a TODO item
*/
api.delete('/todos/:id', async (req, res) => {

  await data.remove(`todo:${req.params.id}`)

  // Query all the TODOs again
  let result = await getTodos(req.query.status)

  // Return the updated list of TODOs
  res.send({
    items: result.items
  })
})

/*
  This is some custom error handler middleware
*/
// eslint-disable-next-line
api.use((err, req, res, next) => {
  // Errors are also streamed live to your terminal in dev mode.
  console.error(err.stack)

  if (!err.statusCode) {
    err.statusCode = 500
  }

  const error = {
    name: err.name,
    statusCode: err.statusCode,
    message: err.message,
  }

  res.status(err.statusCode).json(error)
})

/*
  Sometimes you might want to run code on a schedule, like if you want to 
  send alerts when items are overdue.
*/
schedule.every('60 minutes', async () => {
  console.log(`Checking for overdue TODOs...`)

  // Look for items that are overdue
  let overdueItems = await data.getByLabel('label1', `incomplete:<${new Date().toISOString()}`)

  if (overdueItems.items.length === 0) {
    console.log(`Nothing overdue!`)
  }

  // Loop through the overdue items
  for (let item of overdueItems.items) {
    // Here we could send an alert
    console.log(`ALERT: '${item.value.name}' is overdue!!!`)
  }
})

const expectedScore = (Rb, Ra) => {
  return parseFloat((1 / (1 + Math.pow(10, (Rb - Ra) / 400))).toFixed(4))
}

const winnerScore = (score, expected) => {
  return score + 24 * (1 - expected)
}

const loserScore = (score, expected) => {
  return score + 24 * (0 - expected)
}
const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}
intializeDBAndServer()

//Get list of player
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      *
    FROM 
      cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//Get a player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      cricket_team;
    WHERE
      player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

//Create a new player
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `
  INSERT INTO
    cricket_team (player_name,jersey_number,role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//Update player
app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
  UPDATE 
    cricket_team
  SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  where
    player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 5 Delete method

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteplayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`
  await db.run(deleteplayerQuery)
  response.send('Player Removed')
})

module.exports = app

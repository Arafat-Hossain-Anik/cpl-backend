const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
// fakedata upload
const fs = require('fs');
let fakeData = fs.readFileSync('./fakedata/teamDetais.json');
let datas = JSON.parse(fakeData);
// middleware
app.use(cors())
app.use(express.json());
//connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nptziui.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        // const database = client.db('cpl');
        const database = client.db('fakeCpl');
        const allPlayersCollection = database.collection('allPlayers');
        // const teamPlayersCollection = database.collection('teamPlayers');
        // const publicDataCollection = database.collection('publicData');
        const teamsCollection = database.collection('teams');
        const usersCollection = database.collection('users');
        //const exelCollection = database.collection("exeldata");
        const publicQueryCollection = database.collection("publicQuery");
        console.log('database connected');

        // const result = await teamsCollection.insertMany(datas);
        // res.json(result)
        // console.log(result);


        // getting all from database
        app.get('/players', async (req, res) => {
            const cursor = allPlayersCollection.find({})//////testing data change collection
            const players = await cursor.toArray();
            const finalPlayers = players.filter(player => player.status !== 'bought')
            // res.json(finalPlayers)
            res.send(finalPlayers)
        });
        //get single player
        app.get('/players/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const player = await allPlayersCollection.findOne(query);////testing data change collection
            res.json(player)
        })
        //get players by category
        app.get('/players-cat/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category.toUpperCase() };
            console.log(query);
            const cursor = allPlayersCollection.find(query);
            const players = await cursor.toArray();
            res.json(players)
        })
        //get players by role
        app.get('/players-rol/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role.toUpperCase() };
            const cursor = allPlayersCollection.find(query);
            const players = await cursor.toArray();
            res.json(players)
        })
        //get players by role and category
        app.get('/players-cat-rol/:category/:role', async (req, res) => {
            const category = req.params.category;
            const role = req.params.role;
            const query = { category: category, role: role };
            console.log("query hitted ", query);
            const cursor = allPlayersCollection.find(query);////for testing purpose
            // console.log(cursor)
            const players = await cursor.toArray();
            const finalPlayers = players.filter(player => player.status !== 'bought')
            res.json(finalPlayers)
        })


        //updating buying status
        app.put('/players-bought', async (req, res) => {
            const player = req.body;
            //console.log("from put", player);
            const filter = { _id: ObjectId(player._id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: { status: "bought" }
            };
            const result = await allPlayersCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.send(result);
        })
        // Load data according to user id get api
        // app.get('/cart/:uid', async (req, res) => {
        //     const uid = req.params.uid;
        //     const query = { uid: uid };
        //     const result = await teamPlayersCollection.find(query).toArray();
        //     res.json(result);
        // })
        //get all teams
        app.get('/teams', async (req, res) => {
            const cursor = teamsCollection.find({})
            const teams = await cursor.toArray();
            res.send(teams);
        })


        //get a single team by user email
        app.get('/teams/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const team = await teamsCollection.findOne(query);
            res.send(team);
        })
        //confirm player by admin to a specific team
        app.put('/confirm-player', async (req, res) => {
            const playerData = req.body.playerDetails;
            const teamName = req.body.teamName;
            // console.log(playerData);
            // console.log(teamName);
            const filter = { name: teamName };
            const options = { upsert: true };
            const updateDoc = {
                $push: { players: playerData }
            };
            const result = await teamsCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.send(result);
        })


        //add a single player to database
        app.post('/player', async (req, res) => {
            const player = req.body;
            // console.log(player);
            const result = await allPlayersCollection.insertOne(player)///////testing data
            res.json(result)
        })

        // // add data to cart collection with additional info
        // app.post('/booking/add', async (req, res) => {
        //     const booking = req.body;
        //     console.log(booking);
        //     const result = await teamPlayersCollection.insertOne(booking)
        //     res.json(result)
        // })
        // Post
        // app.post('/players', async (req, res) => {
        //     const service = req.body;
        //     console.log(service);
        //     //const result = await allPlayersCollection.insertOne(service);
        //     const result = await allPlayersCollection.insertMany(service);
        //     res.json(result)
        //     console.log(result);
        // });

        //add public data to temporary database
        app.post('/public', async (req, res) => {
            const publicData = req.body;
            console.log(publicData);
        })
        //add team user
        app.post('/teams', async (req, res) => {
            const teamDetais = req.body;
            // console.log(teamDetais);
            const result = await teamsCollection.insertOne(teamDetais);
            res.json(result)
            console.log(result);
        });

        ///get users---------------------------------------------------users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({})
            const users = await cursor.toArray();
            res.send(users);
        })
        // post users to database
        app.post('/users', async (req, res) => {
            const users = req.body;
            console.log(users)
            const result = usersCollection.insertOne(users);
            res.send(result);
        })
        //update user
        app.put('/users', async (req, res) => {
            const email = req.body;
            // console.log(email);
            const filter = { email: email.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    email: email.email,
                    role: `admin`
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            console.log(result);
            res.send(result);
        });

        ///find admin from user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        // add public data query
        app.put('/public-query', async (req, res) => {
            const data = req.body;
            const filter = { id: 1 };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    category: data.category,
                    role: data.role
                },
            };
            const result = await publicQueryCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            console.log(result);
            res.send(result);
        });
        // get public data query 
        app.get('/public-query', async (req, res) => {
            const data = await publicQueryCollection.findOne();
            // const data = await cursor.toArray();
            res.send(data);
        });

        // // delete one item
        // app.delete('/booking/add/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await teamPlayersCollection.deleteOne(query);
        //     res.json(result);
        //     console.log(result);
        // });
        //delete one player from allplayers list
        app.delete('/players/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allPlayersCollection.deleteOne(query);
            res.json(result);
            console.log(result);
        });
        //inserting exel file to mongodb
        app.post('/api/upload', async (req, res) => {
            try {
                await allPlayersCollection.insertMany(req.body.data);
                res.send('Data uploaded successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send(error.message);
            }
        });
    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('cpl server is running');
})

app.listen(port, () => {
    console.log("server is running", port);
})
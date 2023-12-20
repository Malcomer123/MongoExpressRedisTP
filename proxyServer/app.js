const express = require('express');
const axios = require('axios');
const redis = require('redis');


const client = redis.createClient(6379)

const app = express();

const baseURL = "http://localhost:3000"

app.use(express.json())
app.use(express.static('static'))


let checkCache = (req,res,next) =>{
    let search = req.path + "?id="+ req.query.id;
    client.get(search, (err, data) => {
        if (err) throw err;
        if (!data) {
            console.log("not found");
            return next();
        } else {
            console.log("found!")
            return res.json({ data: JSON.parse(data), info: 'data from cache' });
        }
    });
}

app.get("/users",checkCache, async (req, res)=> {
    try {
        const idParam = req.query.id;
        const response = await axios.get(baseURL + "/users?id="+idParam);
        console.log(response.data)
        client.setex("/users?id=" + idParam, 3600, JSON.stringify(response.data));
        res.json(response.data)
    } catch (err) {
        res.status(500).json({error: err, test: "test"})
    }
})

app.get("/posts",checkCache, async (req, res)=> {
    try {
        const idParam = req.query.id;
        const response = await axios.get(baseURL + "/posts?id="+idParam);
        console.log(response.data)
        client.setex("/posts?id="+idParam, 3600, JSON.stringify(response.data));
        res.json(response.data)
    } catch (err) {
        res.status(500).json({error: err})
    }
})


app.listen(4000)
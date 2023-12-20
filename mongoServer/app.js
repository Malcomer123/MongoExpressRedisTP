const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require ('cors')

const app = express();

app.use(express.json());
app.use(cors());

async function clientDB(){
    const client = new MongoClient('mongodb://localhost:27017/blog_data')

    try {
        await client.connect();
        console.log('Connected to the local MongoDB database');
        return client.db('blog-data');
    } catch (error) {
        console.error('Error connecting to the local MongoDB database:', error);
        throw error;
    }
}

let db;

clientDB().then(database =>{
    db=database
})

app.use(async(req,res,next) => {
    next();
});

app.get("/users", async(req,res)=>{
    try {
        const idParam = req.query.id;
        const response = await db.collection('users').findOne({id: parseInt(idParam)});
        console.log(response);
        res.json(response);
    }catch(e){
        console.log(e);
        res.json({error: e})
    }

});


app.get("/posts", async(req,res)=>{
    try {
        const idParam = req.query.id;
        const response = await db.collection('posts').aggregate([
            {
                $match:{
                    id: parseInt(idParam)
                },
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'id',
                    foreignField: 'postId',
                    as: 'comments'
                }
            }
        ]).toArray({ limit: 1 });
        console.log(response)
        res.json(response);
    }catch(e){
        console.log(e);
        res.json({error: e})
    }
});

app.listen(3000);
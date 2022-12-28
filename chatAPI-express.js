
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port + '!');
  });

const { MongoClient } = require('mongodb');
const { resolve } = require("path");
const uri = "mongodb+srv://Jun:0000@cluster0.nuczk6g.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var chatLog = [];

app.use(express.static('public'));

app.get('/', function (req, res) {
    fs.readFile("index.html", function (err, data) {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        return res.end();
    });
});

app.get('/chat', function (req, res) {
    let user = req.query.user;
    let say = req.query.say;
    if (user && say) {
        let time = new Date();
        chatLog.push({ user: user, say: say, time: time.toLocaleString() });
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(chatLog));
    return res.end();
});

app.get('/chat/save', function (req, res) {
    if (chatLog.length > 0) {
        let delMany = async function () {
            const collection = client.db("webprojHW").collection("chatLog");
            const result = await collection.deleteMany({});
            console.log("Deleted " + result.deletedCount + " documents");
        };
        let insMany = async function () {
            const collection = client.db("webprojHW").collection("chatLog");
            const result = await collection.insertMany(chatLog);
            console.log(`${result.insertedCount} documents were inserted`);
        };
    
        (async () => {
            try {
                await delMany().catch(err => { console.log(err); });
                await insMany().catch(err => { console.log(err); });
            } catch (err) { console.log(err); }
        })();
    }
    else {
        let delMany = async function () {
            const collection = client.db("webprojHW").collection("chatLog");
            const result = await collection.deleteMany({});
            console.log("Deleted " + result.deletedCount + " documents");
        }
        delMany().catch(err => { console.log(err); });
    }   
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(chatLog));
    return res.end();
});

app.get('/chat/reload', function (req, res) {
    let fd = async function () {
        const collection = client.db("webprojHW").collection("chatLog");
        const result = await collection.find({}).toArray();
        chatLog = result;
        console.log("1: end of find");
        // client.close();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(chatLog));
        console.log(chatLog)
        return res.end();
    };
    fd().catch(err => { console.log(err); });
});

app.get('/chat/clear', function (req, res) {
    const collection = client.db("webprojHW").collection("chatLog");
    collection.deleteMany({}, function(err, result) {
        console.log("Deleted all documents from the collection");
    });
    chatRec = [];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(chatRec));
    return res.end();
});
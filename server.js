'use strict'

var express = require('express');
var fs = require('fs');
const { Client } = require('@elastic/elasticsearch')
//const client = new Client({ node: 'http://172.16.0.216:9200' })
const client = new Client({
  node: 'https://172.16.0.209:9200',
  //headers: { 'Authorization': <JWT_TOKEN> },
  // # Headers: JWT TOKEN

  // # Headers: Basic Authentication
  headers: { 'Authorization': 'Basic Ym90OmJvdGJvdA=='}, // bot:botbot
  /*auth: {  // Failed;
    username: 'bot',
    password: 'botbot'
  },*/

  ssl: {
    //ca: fs.readFileSync('./cacert.pem'),
    rejectUnauthorized: false
  }
})

var dataFromElastic = null;
async function run () {
  // Let's start by indexing some data
  /*
  await client.index({
    index: 'testbase',
    type: 'dataset', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      data: [
        {x: 'Apples', value: 128},
        {x:'Oranges', value: 99},
        {x:'Lemons', value: 54},
        {x:'Bananas', value: 15}
      ]
    }
  })
  */

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'testbase' })

  // Let's search!
  const { body } = await client.search({
    index: 'testbase',
    type: 'dataset', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      query: {
        match_all: {}
      }
    }
  })

  //console.log(body.hits.hits)
  //console.log(body.hits.hits[0]._source.data)
  dataFromElastic = body.hits.hits[0]._source.data
}

//run().catch(console.log)

// Creates server instance
var app = express();
 
//create the HTML page and send to the host

var chartTemplate = fs.readFileSync(__dirname + '/index.html').toString();

app.get('/', function (req, res) {
    console.log("In express: HTTP GET, Path: /");
    run().catch(console.log).then(function(result) {
        console.log(dataFromElastic);
        if (dataFromElastic) {
            // For this demo we are using a fs.readFileSync and string replace methods to render the page,
            // in real world application you might use one of the dozens Node.js templating engines.
            var page = chartTemplate.replace("'{{data}}'", JSON.stringify(dataFromElastic));
            res.send(page);
        } else {
            res.status(404);
            res.send('Data not found');
        }
    });
    /*if (dataFromElastic) {

        // For this demo we are using a fs.readFileSync and string replace methods to render the page,
        // in real world application you might use one of the dozens Node.js templating engines.
        var page = chartTemplate.replace("'{{data}}'", JSON.stringify(dataFromElastic));
        res.send(page);
    } else {
        res.status(404);
        res.send('Data not found');
    }*/
});


// Runs express server
app.listen(8080, function () {
    console.log('Example app is listening on port ' + 8080 + '!\n');
});

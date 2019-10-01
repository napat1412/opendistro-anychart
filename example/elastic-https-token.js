'use strict'

const { Client } = require('@elastic/elasticsearch')
//const client = new Client({ node: 'http://172.16.0.216:9200' })
const client = new Client({
  node: 'https://172.16.0.209:9200',
  // # Headers: Basic Authentication
  headers: { 'Authorization': 'Basic Ym90OmJvdGJvdA=='},
  
  // # Headers: TOKEN
  //headers: { 'Authorization': '<TOKEN>' },

  /*auth: {  // Failed;
    username: 'admin',
    password: 'ino@519'
  },*/
  ssl: {
    //ca: fs.readFileSync('./cacert.pem'),
    rejectUnauthorized: false
  }
})

async function run () {
  // Let's start by indexing some data
  await client.index({
    index: 'agriculture-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      character: 'Ned Stark',
      quote: 'Winter is coming.'
    }
  })

  await client.index({
    index: 'agriculture-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      character: 'Daenerys Targaryen',
      quote: 'I am the blood of the dragon.'
    }
  })

  await client.index({
    index: 'agriculture-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      character: 'Tyrion Lannister',
      quote: 'A mind needs books like a sword needs a whetstone.'
    }
  })

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'agriculture-thrones' })

  // Let's search!
  const { body } = await client.search({
    index: 'agriculture-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      query: {
        match: { quote: 'winter' }
      }
    }
  })

  console.log(body.hits.hits)
}

run().catch(console.log)

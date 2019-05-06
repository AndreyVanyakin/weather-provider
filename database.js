const {DB_NAME, DB_URL, COLL_NAME} = require('./config');

const _ = require('lodash');

const MongoClient = require('mongodb').MongoClient;
let client = new MongoClient(DB_URL);
let db;
let collection;

const connect = async ()  => {
    try {
        // OPEN CONNECTON
        await client.connect();
        console.log('[db] Connected to server');
        db = client.db(DB_NAME);
        collection = db.collection(COLL_NAME);
    } catch (err) {
        console.error(err);
    }
}

// OUT [{'name': 'tz_id}, {}, {}]
const readUniqLocations = async () => {
    try {
        console.log('[db] Will read locations from mongo');
        // fetch all data from 'current' coll, but only name and tz_id fields;
        const locNamesZones = (await collection.find({}, {projection: {
            "_id": 0,
            "location.name": 1, 
            "location.tz_id": 1}
        }).toArray())
            .map(lno => lno['location']);

        // await client.close();
        // console.log('[db] Connected closed');

        return _.uniqBy(locNamesZones, 'name');
        // return [{name: aaa, tz_id: ...}, {}]

        


    } catch (err) {
        console.log('[db] Failed to read locations');
        console.error(err);
    }
}

const readAllbyLocation = async (name) => {
    try {
        return (await collection.find({'location.name':name}).toArray())
    } catch (err) {
        console.error(err);
    }
}


module.exports = { connect, readUniqLocations, readAllbyLocation };


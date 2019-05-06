// 1) On startup 
// + gets all unique location names and their tz_ids and persists them in memory.
// DISABLED + start polling the db each 10 minutes to check if new locatiowins were added

// 2) Scheduled job fe location at 1:00 AM of tz
// + get all dates from mongo to []
// + get all dates from DIR to []
// + prepare xlslx files for missing dates  (to maintain all data in mongo available in DIR, even if someone deleted it)
// - write, attempt each 10 mins if error for unlimited time 

const fs = require('fs');
const _ = require('lodash');
const flatten = require('flat');
const cron = require('node-cron');
const promisify = require('util').promisify;
const { WRITE_CRON, FOLDER } = require('./config');
const { unix_YYYYMMDD } = require('./timeseries');

const { writeXlsx } = require('./xlsx')
const { connect, readUniqLocations, readAllbyLocation } = require('./database');
const { initStorage, writeLocations, readKeys, clearStorage } = require('./storage')

const onStartUp = async () => {

    try {
        // Init storage and write all locations 
        await initStorage();
        await connect();
        
        const locs = await readUniqLocations();
        
        await handleNewLocs(locs);
        
        //
        // LOCATIONS UPDATES ARE DISABLED
        //

        // check for location updates on POLL SCHEDULE, create schedules for new
        // const isCron = cron.validate(POLL_CRON);

        // if (isCron) {
        //     console.log('[CRON] POLL_CRON ok, scheduling');
        //     await cron.schedule(POLL_CRON, async () => {
        //         console.log('[CRON] Polling task scheduled');
        //         const locs = await readUniqLocations();
        //         // console.log(locs);
        //         await handleNewLocs(locs);
        //     })
        // } else {
        //     console.log('[CRON] Bad cron at POLL_CRON');
        // }
        
        // await clearStorage(); //FIXME:

    } catch (err) {
        console.error(err);   
    }

    
}

// 
const handleNewLocs = async (locs) => {
    
    try {
        const newLocs = await writeLocations(locs);
        if (newLocs.length > 0) {
            await newLocs.forEach(async loc => {
                const {name, tz_id} = loc;

                if (cron.validate(WRITE_CRON)) {

                    await cron.schedule(WRITE_CRON, async () => {
                        // routine for each location
                        await routine(name);
                    }, {timezone: tz_id})

                } else {
                    console.error('Wrong WRITE_CRON format');
                }
                
            })
        }
    } catch (err) {
        console.error(err);
    }
    
}


const routine = async (name) => {
    
    try {
         //
        // Mongo
        //
        
        const mongoData = await readAllbyLocation(name);
        // console.log(allRecords);
        const mongoDates = _.uniq(_.map(mongoData, rec => unix_YYYYMMDD(rec.location.localtime_epoch)));
        // console.log(mongoDates);
        
        //
        // Folder
        //

        const folderFiles = await promisify(fs.readdir)(FOLDER, ['utf8', true]);
        // Beslan_2019-05-03.xlsx => '2019-05-03'
        const folderDates = folderFiles.filter(f => {
            const isXlsx = _.last(f.split('.')) === 'xlsx';
            const isName = _.head(f.split('_')) === name;
            return isXlsx && isName;
        }).map(f => _.last(_.head(f.split('.')).split('_')));
        // console.log(folderDates);

        // 
        // Missing
        //

        const missingDates = _.difference(mongoDates, folderDates);
        // console.log(mongoDates, folderDates, missingDates);

        // Write xlsx file
        await missingDates.forEach(async date => {
            
            // filter data for this date and preapre it
            const data = mongoData.filter(rec => unix_YYYYMMDD(rec.location.localtime_epoch) === date)
                .map(rec => flatten(rec.current));

            await writeXlsx(name, date, data);

        });
    } catch (err) {
        console.error(err);
    }
   


}

onStartUp();

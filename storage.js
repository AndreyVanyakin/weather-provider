const storage = require('node-persist');
const _ = require('lodash');

async function clearStorage () {
    try {
        await storage.clear();
        console.log('[STORE] Storage cleared');
    } catch (err) {
        console.error(err);
    }
}

async function initStorage() {
    try {
        await storage.init();
        console.log('[STORE] Storage initiated');    
    } catch (err) {
        console.error(err);
    }
}

async function readKeys () {
    try {
        return await storage.keys();    
    } catch (err) {
        console.error(err);
    }
}

// IN [{name, tz_id}, {}, {}]
// will check if storage already has the keys
async function writeLocations (arr) {
    
    try {

        const exisitngKeys = await readKeys();
        const newKeys = _.map(arr, loc => loc.name);
        const missingKeys = _.difference(newKeys, exisitngKeys);
        // console.log(exisitngKeys, newKeys, missingKeys);

        if (missingKeys.length > 0) {
            console.log(`[STORE] Will add ${missingKeys.join(', ')}`);
            const missingArr = _.filter(arr, loc => _.includes(missingKeys, loc.name));

            await missingArr.forEach(async lz => {
                const {name, tz_id} = lz;
                // console.log(name, tz_id);
                await storage.setItem(name, tz_id);
            })

            return missingArr;
        } else {
            console.log('[STORE] No new locations written');
            return [];
        }

    } catch (err) {
        console.error(err);
    }
    
};

module.exports = { initStorage, clearStorage ,writeLocations, readKeys }; 
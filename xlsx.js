const XlsxPopulate = require('xlsx-populate');
const {FOLDER} = require('./config')
const _ = require('lodash');

const columnMap = new Map ([
    ["last_updated_epoch", "A"],
    ["last_updated", "B"],
    ["temp_c", "C"],
    ["is_day", "D"],
    ["condition.text", "E"],
    ["condition.code", "F"],
    ["wind_kph", "G"],
    ["wind_degree", "H"],
    ["wind_dir", "I"],
    ["pressure_mb", "J"],
    ["precip_mm", "K"],
    ["humidity", "L"],
    ["cloud", "M"],
    ["feelslike_c", "N"],
    ["vis_km", "O"],
    ["uv", "P"],
    ["gust_kph", "Q"],
])

const writeXlsx = async (name, date, data) => {

    try {
        const workbook = await XlsxPopulate.fromBlankAsync();

        // populate header
        columnMap.forEach((v,k) => {
            workbook.sheet(0).cell(`${v}1`).value(k);
        })

        // populate data
        let rowNo = 2;
        data.forEach(data => {
            columnMap.forEach((v,k) => {
                workbook.sheet(0).cell(`${v}${rowNo}`).value(data[k])
            })
            rowNo += 1;
        })

        await workbook.toFileAsync(`${FOLDER}//${name}_${date}.xlsx`)    
        
    } catch (err) {
        console.error(err);
    }

    
}

module.exports = {writeXlsx}
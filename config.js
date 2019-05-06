
// https://crontab.guru/#0_13_*/1_*_*
module.exports = {
    DB_URL: "mongodb://localhost:27017/",
    DB_NAME:'apixu-weather',
    COLL_NAME: 'current',
    FOLDER: '//Fileserv//ste//ОСМ//00_Проекты//Нальчик - В2 пилот//_Данные_метео_apixu',
    // POLL_CRON: '0 */2 * * *', // every 2 hrs 
    WRITE_CRON: '0 1 */1 * *', //everyday 1AM localtime
};
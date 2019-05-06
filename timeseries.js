const moment = require('moment');


const unix_YYYYMMDD = (unixSecs) => (moment.unix(unixSecs).format('YYYY-MM-DD'))

module.exports = {unix_YYYYMMDD};
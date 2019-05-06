const Service = require('node-windows').Service;
const EventLogger = require('node-windows').EventLogger;

// Create a new service object
const svc = new Service({
    name:'Weather provider',
    description: 'Writes xlsx with apixu weather to folder daily aw 1AM',
    script: require('path').join(__dirname, 'index.js'),
    // script: 'C:\\_me\\Dev\\weather-grabber\\index.js',
    wait: 2,
    grow: .5,
    nodeOptions: [
      '--harmony',
      '--max_old_space_size=4096'
    ]
});   

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    svc.start();
});
  
svc.install();

// Listen for the "uninstall" event so we know when it's done.
// svc.on('uninstall',function(){
//     console.log('Uninstall complete.');
//     console.log('The service exists: ',svc.exists);
// });
  
// Uninstall the service.
// svc.uninstall();

const log = new EventLogger('Weather provider');
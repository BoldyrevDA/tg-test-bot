import { winService } from "./windows-service.js";

winService.on('uninstall',function(){
    console.log('Uninstall complete.');
    console.log('The service exists: ', winService.exists);
});

// Uninstall the service.
winService.uninstall();
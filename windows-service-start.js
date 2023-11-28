import { winService } from "./windows-service.js";

winService.on('install', () => {
    winService.start();
});

winService.on('alreadyinstalled', () => {
    console.log('The service exists: ', winService.exists);
    winService.start();
});

winService.install();
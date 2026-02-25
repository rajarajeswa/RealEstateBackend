// Clear require cache
Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
});

// Now start the server
require('./server.js');

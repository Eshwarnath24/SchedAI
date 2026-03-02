/**
 * notifications/eventEmitter.js
 *
 * Shared singleton EventEmitter2 instance — mirrors how @nestjs/event-emitter
 * provides a module-scoped emitter that every service can inject.
 *
 * EventEmitter2 adds:
 *  • Wildcard listeners  (e.g.  'class.*')
 *  • Namespaced events   (dot-separated)
 *  • Async / promisified emit
 *
 * Import this file wherever you need to emit or listen to application events.
 */

const EventEmitter2 = require('eventemitter2');

const eventEmitter = new EventEmitter2({
    // Allow wildcard listeners like  eventEmitter.on('leave.*', handler)
    wildcard: true,

    // Use '.' as the namespace delimiter  (same convention as NestJS)
    delimiter: '.',

    // Maximum listeners per event (increase if you add many modules)
    maxListeners: 20,

    // Emit an error event if the emitter has exceeded maxListeners
    verboseMemoryLeak: true,
});

module.exports = eventEmitter;

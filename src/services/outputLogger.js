"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputLogger = void 0;
class OutputLogger {
    constructor(channel) {
        this.channel = channel;
    }
    info(message) {
        this.write('INFO', message);
    }
    warn(message) {
        this.write('WARN', message);
    }
    error(message) {
        this.write('ERROR', message);
    }
    write(level, message) {
        const timestamp = new Date().toISOString();
        this.channel.appendLine(`[${timestamp}] [${level}] ${message}`);
    }
}
exports.OutputLogger = OutputLogger;
//# sourceMappingURL=outputLogger.js.map
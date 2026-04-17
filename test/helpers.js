"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = void 0;
exports.createMockOutputChannel = createMockOutputChannel;
exports.createMockWorkspaceConfiguration = createMockWorkspaceConfiguration;
const assert = __importStar(require("assert"));
exports.assert = assert;
function createMockOutputChannel() {
    return {
        name: 'test',
        append: () => { },
        appendLine: () => { },
        clear: () => { },
        show: () => { },
        hide: () => { },
        dispose: () => { },
    };
}
function createMockWorkspaceConfiguration(settings) {
    const config = new Map(Object.entries(settings ?? {}));
    return {
        get: (key, defaultValue) => {
            const value = config.get(key);
            return (value !== undefined ? value : defaultValue);
        },
        has: (key) => config.has(key),
        update: async () => { },
        inspect: () => ({ key, defaultValue: undefined, globalValue: undefined, workspaceValue: undefined }),
    };
}
//# sourceMappingURL=helpers.js.map
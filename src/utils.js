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
exports.normalizePath = normalizePath;
exports.toAbsolutePath = toAbsolutePath;
exports.uniqueSorted = uniqueSorted;
exports.basenameWithoutExecutableExtension = basenameWithoutExecutableExtension;
exports.replaceTemplateVariables = replaceTemplateVariables;
exports.getDefaultExecutablePath = getDefaultExecutablePath;
exports.extractProgramPath = extractProgramPath;
exports.quoteForShell = quoteForShell;
exports.relativeDisplayPath = relativeDisplayPath;
exports.parseJsonBuffer = parseJsonBuffer;
const path = __importStar(require("path"));
function normalizePath(filePath) {
    const normalized = path.normalize(filePath);
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}
function toAbsolutePath(candidatePath, baseDir) {
    const normalizedCandidate = candidatePath.replace(/\\/g, path.sep).replace(/\//g, path.sep);
    return path.isAbsolute(normalizedCandidate)
        ? path.normalize(normalizedCandidate)
        : path.resolve(baseDir, normalizedCandidate);
}
function uniqueSorted(items) {
    return Array.from(new Set(items)).sort((left, right) => left.localeCompare(right));
}
function basenameWithoutExecutableExtension(targetName) {
    const parsed = path.parse(targetName);
    if (parsed.ext.toLowerCase() === '.exe') {
        return parsed.name;
    }
    return parsed.base;
}
function replaceTemplateVariables(template, variables) {
    const valueMap = variables;
    return template.replace(/\$\{([^}]+)\}/g, (_, key) => valueMap[key] ?? '');
}
function getDefaultExecutablePath(buildDir, targetName) {
    const hasExtension = path.extname(targetName).length > 0;
    const executableName = process.platform === 'win32' && !hasExtension
        ? `${targetName}.exe`
        : targetName;
    return path.join(buildDir, executableName);
}
function extractProgramPath(commandOrPath) {
    const trimmed = commandOrPath.trim();
    if (!trimmed) {
        return trimmed;
    }
    if (trimmed.startsWith('"')) {
        const closingQuoteIndex = trimmed.indexOf('"', 1);
        return closingQuoteIndex > 1 ? trimmed.slice(1, closingQuoteIndex) : trimmed.slice(1);
    }
    const firstSpace = trimmed.search(/\s/);
    return firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
}
function quoteForShell(commandPart) {
    return commandPart.includes(' ') ? `"${commandPart}"` : commandPart;
}
function relativeDisplayPath(filePath, sourceDir) {
    const relative = path.relative(sourceDir, filePath);
    return relative && !relative.startsWith('..') ? relative : filePath;
}
function parseJsonBuffer(content) {
    const buffer = Buffer.from(content);
    let lastError;
    for (const encoding of getJsonEncodingCandidates(buffer)) {
        try {
            const text = decodeJsonBuffer(buffer, encoding).replace(/^\uFEFF/, '');
            return {
                value: JSON.parse(text),
                encoding,
            };
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError instanceof Error
        ? lastError
        : new Error('Unable to parse JSON content with supported encodings');
}
function getJsonEncodingCandidates(buffer) {
    const candidates = [];
    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        candidates.push('utf8');
    }
    else if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        candidates.push('utf16le');
    }
    else if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
        candidates.push('utf16be');
    }
    for (const encoding of ['utf8', 'utf16le', 'utf16be']) {
        if (!candidates.includes(encoding)) {
            candidates.push(encoding);
        }
    }
    return candidates;
}
function decodeJsonBuffer(buffer, encoding) {
    if (encoding === 'utf8') {
        return new TextDecoder('utf-8').decode(buffer);
    }
    if (encoding === 'utf16le') {
        return new TextDecoder('utf-16le').decode(buffer);
    }
    const swapped = Buffer.from(buffer);
    for (let index = 0; index + 1 < swapped.length; index += 2) {
        const first = swapped[index];
        swapped[index] = swapped[index + 1];
        swapped[index + 1] = first;
    }
    return new TextDecoder('utf-16le').decode(swapped);
}
//# sourceMappingURL=utils.js.map
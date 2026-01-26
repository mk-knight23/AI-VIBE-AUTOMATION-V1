import { NodeExecutor } from "./types";
import {
    manualTriggerExecutor,
    httpRequestExecutor,
    aiExecutor,
    ifElseExecutor,
    delayExecutor,
    variableExecutor,
    codeExecutor,
    loopExecutor,
    slackExecutor,
    discordExecutor,
    emailExecutor,
    transformExecutor,
    filterExecutor,
    switchExecutor,
    mergeExecutor,
    retryExecutor,
    waitUntilExecutor,
    jsonExecutor,
    dateTimeExecutor,
    mathExecutor,
    textExecutor,
    arrayExecutor,
    hashExecutor,
    logExecutor,
    validateExecutor,
    compareExecutor,
    aggregateExecutor
} from "./executors";

// Placeholder executor for unimplemented nodes
const placeholderExecutor: NodeExecutor = async ({ node, context, step }) => {
    return step.run(`placeholder-${node.id}`, async () => {
        console.warn(`Node type ${node.type} is not yet implemented.`);
        return { ...context, [node.id]: { success: true, message: "Not implemented" } };
    });
};

export const executorRegistry: Record<string, NodeExecutor> = {
    "start": manualTriggerExecutor,
    "api": httpRequestExecutor,
    "ai": aiExecutor,
    "ifelse": ifElseExecutor,
    "delay": delayExecutor,
    "variable": variableExecutor,
    "code": codeExecutor,
    "loop": loopExecutor,
    "slack": slackExecutor,
    "discord": discordExecutor,
    "email": emailExecutor,
    "transform": transformExecutor,
    "filter": filterExecutor,
    "switch": switchExecutor,
    "merge": mergeExecutor,
    "retry": retryExecutor,
    "waitUntil": waitUntilExecutor,
    "json": jsonExecutor,
    "dateTime": dateTimeExecutor,
    "math": mathExecutor,
    "text": textExecutor,
    "array": arrayExecutor,
    "hash": hashExecutor,
    "log": logExecutor,
    "validate": validateExecutor,
    "compare": compareExecutor,
    "aggregate": aggregateExecutor,
    "end": placeholderExecutor,
};

export function getExecutor(type: string): NodeExecutor {
    const executor = executorRegistry[type];
    if (!executor) {
        console.warn(`No executor found for node type: ${type}. Using placeholder.`);
        return placeholderExecutor;
    }
    return executor;
}

import ky from "ky";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NodeExecutor, WorkflowContext } from "./types";
import { compileTemplate, compileJsonBody } from "./template";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

/**
 * START NODE
 */
export const manualTriggerExecutor: NodeExecutor = async ({ node, context, step }) => {
    return step.run(`manual-trigger-${node.id}`, async () => {
        const updatedContext: WorkflowContext = { ...context };
        updatedContext[node.id] = { success: true, timestamp: new Date() };
        return updatedContext;
    });
};

/**
 * DELAY NODE
 */
export const delayExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { duration = 1000 } = node.data || {};

    await step.sleep(`delay-${node.id}`, `${duration}ms`);

    return step.run(`delay-log-${node.id}`, async () => {
        const updatedContext: WorkflowContext = { ...context };
        updatedContext[node.id] = { success: true };
        return updatedContext;
    });
};

/**
 * VARIABLE NODE
 */
export const variableExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { variableName, value } = node.data || {};

    return step.run(`variable-${node.id}`, async () => {
        const updatedContext: WorkflowContext = { ...context };
        if (variableName) {
            updatedContext[variableName] = value;
        }
        updatedContext[node.id] = { success: true, variableName, value };
        return updatedContext;
    });
};

/**
 * IF/ELSE NODE
 */
export const ifElseExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { condition } = node.data || {};

    return step.run(`if-else-${node.id}`, async () => {
        try {
            let evalCondition = condition || "false";

            // Inject context variables into scope for evaluation
            // Safe-ish evaluation using Function constructor
            const keys = Object.keys(context);
            const values = Object.values(context);
            const execute = new Function(...keys, `return ${evalCondition}`);

            const result = !!execute(...values);

            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: true,
                result,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`If/Else node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                result: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * HTTP REQUEST NODE
 * Supports Handlebars templates in URL and body fields
 * Uses variableName for output to prevent key collisions
 */
export const httpRequestExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { url, method = "GET", body, headers, variableName } = node.data || {};

    if (!url) {
        throw new Error(`HTTP Request node ${node.id} is missing a URL`);
    }

    return step.run(`http-request-${node.id}`, async () => {
        try {
            // Compile URL with template context
            const compiledUrl = compileTemplate(url, context);

            // Build request options
            const requestOptions: Record<string, any> = {
                method,
            };

            // Add body for POST/PUT/PATCH with proper headers
            if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
                const compiledBody = compileJsonBody(body, context);
                if (compiledBody) {
                    requestOptions.json = compiledBody;
                }
                // Ensure Content-Type header is set
                requestOptions.headers = {
                    "Content-Type": "application/json",
                    ...(headers ? JSON.parse(headers as string) : {}),
                };
            } else if (headers) {
                requestOptions.headers = JSON.parse(headers as string);
            }

            const response = await ky(compiledUrl, requestOptions).json();

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: true,
                data: response,
                status: 200,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`HTTP Request node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};


/**
 * AI AGENT NODE (Multi-Provider)
 * Supports OpenAI, Anthropic, and Google via AI SDK
 * Supports Handlebars templates in prompt and systemPrompt fields
 * Uses variableName for output to enable clean context referencing
 */
export const aiExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        prompt,
        systemPrompt,
        provider = "google",
        model = "gemini-1.5-flash",
        temperature = 0.7,
        variableName
    } = node.data || {};

    return step.run(`ai-agent-${node.id}`, async () => {
        try {
            // Compile prompts with template context
            const compiledPrompt = compileTemplate(prompt || "", context);
            const compiledSystemPrompt = systemPrompt ? compileTemplate(systemPrompt, context) : "";

            let text: string;

            // Use AI SDK for unified interface across providers
            if (provider === "openai" || provider === "anthropic") {
                // Dynamic import to avoid bundling issues
                const { generateText } = await import("ai");
                const { getAIModel } = await import("@/lib/ai/providers");

                const aiModel = getAIModel(provider, model);
                const result = await generateText({
                    model: aiModel,
                    system: compiledSystemPrompt || undefined,
                    prompt: compiledPrompt,
                    temperature,
                });
                text = result.text;
            } else {
                // Use Google Generative AI directly for better compatibility
                const geminiModel = genAI.getGenerativeModel({ model });
                const fullPrompt = compiledSystemPrompt
                    ? `${compiledSystemPrompt}\n\n${compiledPrompt}`
                    : compiledPrompt;

                const result = await geminiModel.generateContent(fullPrompt);
                const response = await result.response;
                text = response.text();
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: true,
                text,
                provider,
                model,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`AI Agent node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: false,
                error: error.message,
                provider,
                model,
            };
            return updatedContext;
        }
    });
};


/**
 * CODE NODE
 */
export const codeExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { code, outputVariable } = node.data || {};

    return step.run(`code-execution-${node.id}`, async () => {
        try {
            const keys = Object.keys(context);
            const values = Object.values(context);
            const execute = new Function(...keys, `${code}`);

            const result = execute(...values);

            const updatedContext: WorkflowContext = { ...context };
            if (outputVariable) {
                updatedContext[outputVariable] = result;
            }
            updatedContext[node.id] = {
                success: true,
                result,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Code node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * LOOP NODE
 */
export const loopExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { count = 1 } = node.data || {};

    return step.run(`loop-status-${node.id}`, async () => {
        const updatedContext: WorkflowContext = { ...context };

        const stateKey = `loop_state_${node.id}`;
        const currentCount = (context[stateKey]?.count || 0) + 1;

        updatedContext[stateKey] = {
            count: currentCount,
            isFinished: currentCount >= count
        };

        updatedContext[node.id] = {
            success: true,
            currentCount,
            isFinished: currentCount >= count
        };

        return updatedContext;
    });
};

/**
 * SLACK NODE
 * Sends messages to Slack via Incoming Webhook URL
 * Supports Handlebars templates in message field
 */
export const slackExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { webhookUrl, message, channel, username = "Agentify Bot" } = node.data || {};

    if (!webhookUrl) {
        throw new Error(`Slack node ${node.id} is missing a webhook URL`);
    }

    return step.run(`slack-${node.id}`, async () => {
        try {
            const compiledMessage = compileTemplate(message || "", context);

            const payload: Record<string, any> = {
                text: compiledMessage,
                username,
            };

            if (channel) {
                payload.channel = channel;
            }

            await ky.post(webhookUrl, { json: payload });

            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: true,
                message: compiledMessage,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Slack node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * DISCORD NODE
 * Sends messages to Discord via Webhook URL
 * Supports Handlebars templates and embeds
 */
export const discordExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { webhookUrl, message, username = "Agentify", embedTitle, embedColor } = node.data || {};

    if (!webhookUrl) {
        throw new Error(`Discord node ${node.id} is missing a webhook URL`);
    }

    return step.run(`discord-${node.id}`, async () => {
        try {
            const compiledMessage = compileTemplate(message || "", context);

            const payload: Record<string, any> = {
                username,
            };

            // Use embed if title provided, otherwise plain content
            if (embedTitle) {
                payload.embeds = [{
                    title: compileTemplate(embedTitle, context),
                    description: compiledMessage,
                    color: embedColor ? parseInt(embedColor.replace("#", ""), 16) : 0x7c3aed, // Default violet
                }];
            } else {
                payload.content = compiledMessage;
            }

            await ky.post(webhookUrl, { json: payload });

            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: true,
                message: compiledMessage,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Discord node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * EMAIL NODE
 * Sends emails via external email service API
 * Supports Handlebars templates in subject and body
 */
export const emailExecutor: NodeExecutor = async ({ node, context, step }) => {
    const { to, subject, body, apiEndpoint } = node.data || {};

    // Use a generic email API endpoint (user configures their own service)
    const emailApi = apiEndpoint || process.env.EMAIL_API_ENDPOINT;

    if (!emailApi) {
        throw new Error(`Email node ${node.id} requires an email API endpoint`);
    }

    return step.run(`email-${node.id}`, async () => {
        try {
            const compiledTo = compileTemplate(to || "", context);
            const compiledSubject = compileTemplate(subject || "", context);
            const compiledBody = compileTemplate(body || "", context);

            await ky.post(emailApi, {
                json: {
                    to: compiledTo,
                    subject: compiledSubject,
                    body: compiledBody,
                }
            });

            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: true,
                to: compiledTo,
                subject: compiledSubject,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Email node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * TRANSFORM NODE
 * Extracts and transforms data from context using JSONPath-like expressions
 * Supports mapping arrays and extracting nested properties
 */
export const transformExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        source,        // Context key to read from (e.g., "apiResult.data")
        mappings,      // Array of {from: string, to: string} mappings
        variableName
    } = node.data || {};

    return step.run(`transform-${node.id}`, async () => {
        try {
            // Helper to get nested value from object
            const getNestedValue = (obj: any, path: string): any => {
                return path.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            // Get source data
            const sourceData = source ? getNestedValue(context, source) : context;

            let result: any;

            if (mappings && Array.isArray(mappings)) {
                // Apply mappings
                if (Array.isArray(sourceData)) {
                    // Map array items
                    result = sourceData.map((item: any) => {
                        const mapped: Record<string, any> = {};
                        for (const mapping of mappings) {
                            mapped[mapping.to] = getNestedValue(item, mapping.from);
                        }
                        return mapped;
                    });
                } else {
                    // Map single object
                    result = {};
                    for (const mapping of mappings) {
                        result[mapping.to] = getNestedValue(sourceData, mapping.from);
                    }
                }
            } else {
                // Just pass through the source data
                result = sourceData;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: true,
                data: result,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Transform node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * FILTER NODE
 * Filters arrays based on conditions
 * Supports simple comparison operations
 */
export const filterExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        source,        // Context key containing array
        field,         // Field to filter on
        operator,      // "eq", "ne", "gt", "lt", "contains"
        value,         // Value to compare against (supports templates)
        variableName
    } = node.data || {};

    return step.run(`filter-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, path: string): any => {
                return path.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceData = source ? getNestedValue(context, source) : [];

            if (!Array.isArray(sourceData)) {
                throw new Error("Filter source must be an array");
            }

            const compareValue = compileTemplate(String(value || ""), context);

            const filtered = sourceData.filter((item: any) => {
                const itemValue = field ? getNestedValue(item, field) : item;

                switch (operator) {
                    case "eq": return String(itemValue) === compareValue;
                    case "ne": return String(itemValue) !== compareValue;
                    case "gt": return Number(itemValue) > Number(compareValue);
                    case "lt": return Number(itemValue) < Number(compareValue);
                    case "gte": return Number(itemValue) >= Number(compareValue);
                    case "lte": return Number(itemValue) <= Number(compareValue);
                    case "contains": return String(itemValue).includes(compareValue);
                    default: return true;
                }
            });

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: true,
                data: filtered,
                count: filtered.length,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Filter node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * SWITCH NODE
 * Multi-way conditional routing based on value matching
 * Returns matched case name in output for edge routing
 */
export const switchExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        source,    // Context path to value to switch on
        cases,     // Array of {value: string, name: string}
        defaultCase = "default"
    } = node.data || {};

    return step.run(`switch-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, path: string): any => {
                return path.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceValue = source ? String(getNestedValue(context, source)) : "";

            // Find matching case
            let matchedCase = defaultCase;
            if (cases && Array.isArray(cases)) {
                for (const c of cases) {
                    const caseValue = compileTemplate(String(c.value || ""), context);
                    if (sourceValue === caseValue) {
                        matchedCase = c.name || c.value;
                        break;
                    }
                }
            }

            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: true,
                sourceValue,
                matchedCase,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Switch node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * MERGE NODE
 * Aggregates data from multiple context sources into one
 * Useful for combining results from parallel branches
 */
export const mergeExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        sources,       // Array of context paths to merge
        strategy = "object",  // "object" (combine as object) or "array" (combine as array)
        variableName
    } = node.data || {};

    return step.run(`merge-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, path: string): any => {
                return path.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            let merged: any;

            if (sources && Array.isArray(sources)) {
                if (strategy === "array") {
                    merged = sources.map((src: string) => getNestedValue(context, src));
                } else {
                    merged = {};
                    for (const src of sources) {
                        const key = src.split(".").pop() || src;
                        merged[key] = getNestedValue(context, src);
                    }
                }
            } else {
                merged = {};
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = {
                success: true,
                data: merged,
            };
            return updatedContext;
        } catch (error: any) {
            console.error(`Merge node ${node.id} failed:`, error);
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = {
                success: false,
                error: error.message,
            };
            return updatedContext;
        }
    });
};

/**
 * RETRY NODE
 * Wraps an HTTP request with retry logic and exponential backoff
 */
export const retryExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        url,
        method = "GET",
        maxRetries = 3,
        initialDelay = 1000,  // ms
        backoffMultiplier = 2,
        variableName
    } = node.data || {};

    return step.run(`retry-${node.id}`, async () => {
        const compiledUrl = compileTemplate(url || "", context);
        let lastError: Error | null = null;
        let attempts = 0;

        for (let i = 0; i <= maxRetries; i++) {
            attempts = i + 1;
            try {
                const response = await ky(compiledUrl, {
                    method,
                    timeout: 30000,
                    retry: 0  // We handle retries ourselves
                });
                const data = await response.json();

                const updatedContext: WorkflowContext = { ...context };
                const resultKey = variableName || node.id;
                updatedContext[resultKey] = {
                    success: true,
                    data,
                    attempts,
                };
                return updatedContext;
            } catch (error: any) {
                lastError = error;
                if (i < maxRetries) {
                    const delay = initialDelay * Math.pow(backoffMultiplier, i);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All retries exhausted
        const updatedContext: WorkflowContext = { ...context };
        const resultKey = variableName || node.id;
        updatedContext[resultKey] = {
            success: false,
            error: lastError?.message || "Max retries exceeded",
            attempts,
        };
        return updatedContext;
    });
};

/**
 * WAIT UNTIL NODE
 * Polls a condition until it becomes true or timeout
 */
export const waitUntilExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        source,           // Context path to check
        condition,        // "truthy", "falsy", "eq", "ne"
        compareValue,     // Value to compare against
        pollInterval = 5000,  // ms between checks
        timeout = 60000,      // max wait time in ms
        variableName
    } = node.data || {};

    return step.run(`waitUntil-${node.id}`, async () => {
        const getNestedValue = (obj: any, path: string): any => {
            return path.split(".").reduce((acc, key) => acc?.[key], obj);
        };

        const startTime = Date.now();
        let checkCount = 0;

        const checkCondition = (): boolean => {
            const value = source ? getNestedValue(context, source) : null;
            const compiled = compareValue ? compileTemplate(String(compareValue), context) : "";

            switch (condition) {
                case "truthy": return !!value;
                case "falsy": return !value;
                case "eq": return String(value) === compiled;
                case "ne": return String(value) !== compiled;
                default: return !!value;
            }
        };

        while (Date.now() - startTime < timeout) {
            checkCount++;
            if (checkCondition()) {
                const updatedContext: WorkflowContext = { ...context };
                const resultKey = variableName || node.id;
                updatedContext[resultKey] = {
                    success: true,
                    conditionMet: true,
                    checkCount,
                    elapsedMs: Date.now() - startTime,
                };
                return updatedContext;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        // Timeout
        const updatedContext: WorkflowContext = { ...context };
        const resultKey = variableName || node.id;
        updatedContext[resultKey] = {
            success: false,
            conditionMet: false,
            checkCount,
            error: "Timeout waiting for condition",
        };
        return updatedContext;
    });
};

/**
 * JSON NODE
 * Parse, stringify, get, or set JSON data
 */
export const jsonExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        operation = "parse",  // "parse", "stringify", "get", "set"
        source,               // Input data path
        path,                 // JSONPath for get/set operations
        value,                // Value for set operation
        variableName
    } = node.data || {};

    return step.run(`json-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const setNestedValue = (obj: any, p: string, val: any): any => {
                const keys = p.split(".");
                const result = { ...obj };
                let current = result;
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = { ...current[keys[i]] };
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = val;
                return result;
            };

            const sourceData = source ? getNestedValue(context, source) : null;
            let result: any;

            switch (operation) {
                case "parse":
                    result = typeof sourceData === "string" ? JSON.parse(sourceData) : sourceData;
                    break;
                case "stringify":
                    result = JSON.stringify(sourceData, null, 2);
                    break;
                case "get":
                    result = path ? getNestedValue(sourceData, path) : sourceData;
                    break;
                case "set":
                    const compiledValue = compileTemplate(String(value || ""), context);
                    result = setNestedValue(sourceData || {}, path || "", compiledValue);
                    break;
                default:
                    result = sourceData;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, data: result };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * DATETIME NODE
 * Format, parse, and calculate dates
 */
export const dateTimeExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        operation = "now",    // "now", "format", "parse", "add", "diff"
        source,               // Date input for format/parse/add
        format = "ISO",       // "ISO", "unix", "date", "time", custom
        amount,               // For add: number to add
        unit = "days",        // For add: "days", "hours", "minutes"
        variableName
    } = node.data || {};

    return step.run(`datetime-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            let date: Date;
            let result: any;

            if (operation === "now") {
                date = new Date();
            } else {
                const sourceValue = source ? getNestedValue(context, source) : null;
                date = sourceValue ? new Date(sourceValue) : new Date();
            }

            switch (operation) {
                case "now":
                case "format":
                    if (format === "ISO") result = date.toISOString();
                    else if (format === "unix") result = Math.floor(date.getTime() / 1000);
                    else if (format === "date") result = date.toLocaleDateString();
                    else if (format === "time") result = date.toLocaleTimeString();
                    else result = date.toISOString();
                    break;
                case "add":
                    const ms = unit === "days" ? 86400000 : unit === "hours" ? 3600000 : 60000;
                    const newDate = new Date(date.getTime() + (Number(amount) || 0) * ms);
                    result = format === "unix" ? Math.floor(newDate.getTime() / 1000) : newDate.toISOString();
                    break;
                case "parse":
                    result = date.toISOString();
                    break;
                default:
                    result = date.toISOString();
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, value: result, timestamp: date.getTime() };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * MATH NODE
 * Arithmetic operations, random numbers, and aggregations
 */
export const mathExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        operation = "add",  // "add", "subtract", "multiply", "divide", "random", "min", "max", "round", "abs"
        a,                  // First operand (context path or value)
        b,                  // Second operand
        min = 0,            // For random
        max = 100,          // For random
        precision = 2,      // For round
        variableName
    } = node.data || {};

    return step.run(`math-${node.id}`, async () => {
        try {
            const getVal = (v: any): number => {
                if (typeof v === "number") return v;
                const compiled = compileTemplate(String(v || "0"), context);
                return parseFloat(compiled) || 0;
            };

            let result: number;
            const valA = getVal(a);
            const valB = getVal(b);

            switch (operation) {
                case "add": result = valA + valB; break;
                case "subtract": result = valA - valB; break;
                case "multiply": result = valA * valB; break;
                case "divide": result = valB !== 0 ? valA / valB : 0; break;
                case "random": result = Math.floor(Math.random() * (max - min + 1)) + min; break;
                case "min": result = Math.min(valA, valB); break;
                case "max": result = Math.max(valA, valB); break;
                case "round": result = Number(valA.toFixed(precision)); break;
                case "abs": result = Math.abs(valA); break;
                case "floor": result = Math.floor(valA); break;
                case "ceil": result = Math.ceil(valA); break;
                default: result = valA;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, value: result };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * TEXT NODE
 * String manipulation operations
 */
export const textExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        operation = "concat",  // "concat", "split", "join", "replace", "upper", "lower", "trim", "substring", "length"
        source,                // Input text (context path)
        value,                 // Second value for concat/replace/split
        start = 0,             // For substring
        end,                   // For substring
        variableName
    } = node.data || {};

    return step.run(`text-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceText = source ? String(getNestedValue(context, source) || "") : "";
            const compiledValue = value ? compileTemplate(String(value), context) : "";

            let result: any;

            switch (operation) {
                case "concat": result = sourceText + compiledValue; break;
                case "split": result = sourceText.split(compiledValue || ","); break;
                case "join":
                    const arr = Array.isArray(getNestedValue(context, source))
                        ? getNestedValue(context, source)
                        : [sourceText];
                    result = arr.join(compiledValue || ", ");
                    break;
                case "replace":
                    const [find, replace] = compiledValue.split("|");
                    result = sourceText.replace(new RegExp(find, "g"), replace || "");
                    break;
                case "upper": result = sourceText.toUpperCase(); break;
                case "lower": result = sourceText.toLowerCase(); break;
                case "trim": result = sourceText.trim(); break;
                case "substring": result = sourceText.substring(start, end); break;
                case "length": result = sourceText.length; break;
                case "includes": result = sourceText.includes(compiledValue); break;
                default: result = sourceText;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, value: result };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * ARRAY NODE
 * Array manipulation operations
 */
export const arrayExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        operation = "push",  // "push", "pop", "shift", "slice", "sort", "reverse", "unique", "find", "count", "first", "last"
        source,              // Array source path
        value,               // Value to add/find
        start = 0,           // For slice
        end,                 // For slice
        sortField,           // Field to sort by (for objects)
        sortOrder = "asc",   // "asc" or "desc"
        variableName
    } = node.data || {};

    return step.run(`array-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceArr = source ? getNestedValue(context, source) : [];
            if (!Array.isArray(sourceArr)) {
                throw new Error("Source must be an array");
            }

            let result: any;
            const arr = [...sourceArr]; // Clone to avoid mutation

            switch (operation) {
                case "push":
                    const compiledVal = value ? compileTemplate(String(value), context) : null;
                    result = [...arr, compiledVal];
                    break;
                case "pop": result = arr.slice(0, -1); break;
                case "shift": result = arr.slice(1); break;
                case "slice": result = arr.slice(start, end); break;
                case "reverse": result = arr.reverse(); break;
                case "unique": result = [...new Set(arr)]; break;
                case "sort":
                    result = arr.sort((a, b) => {
                        const valA = sortField ? a[sortField] : a;
                        const valB = sortField ? b[sortField] : b;
                        const cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
                        return sortOrder === "desc" ? -cmp : cmp;
                    });
                    break;
                case "find":
                    const searchVal = value ? compileTemplate(String(value), context) : null;
                    result = arr.find(item => item === searchVal || JSON.stringify(item).includes(String(searchVal)));
                    break;
                case "count": result = arr.length; break;
                case "first": result = arr[0]; break;
                case "last": result = arr[arr.length - 1]; break;
                default: result = arr;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, data: result, count: Array.isArray(result) ? result.length : 1 };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * HASH NODE
 * Generate hashes, UUIDs, and encode/decode
 */
export const hashExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        operation = "uuid",  // "uuid", "md5", "sha256", "base64Encode", "base64Decode"
        source,              // Input for hashing/encoding
        variableName
    } = node.data || {};

    return step.run(`hash-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceVal = source ? String(getNestedValue(context, source) || "") : "";
            let result: string;

            switch (operation) {
                case "uuid":
                    result = crypto.randomUUID();
                    break;
                case "md5":
                    const { createHash } = await import("crypto");
                    result = createHash("md5").update(sourceVal).digest("hex");
                    break;
                case "sha256":
                    const { createHash: createSha } = await import("crypto");
                    result = createSha("sha256").update(sourceVal).digest("hex");
                    break;
                case "base64Encode":
                    result = Buffer.from(sourceVal).toString("base64");
                    break;
                case "base64Decode":
                    result = Buffer.from(sourceVal, "base64").toString("utf-8");
                    break;
                case "random":
                    const { randomBytes } = await import("crypto");
                    result = randomBytes(16).toString("hex");
                    break;
                default:
                    result = crypto.randomUUID();
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, value: result };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * LOG NODE
 * Debug logging for workflow development
 */
export const logExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        message,         // Log message (supports templates)
        level = "info",  // "debug", "info", "warn", "error"
        sources,         // Array of context paths to log
        variableName
    } = node.data || {};

    return step.run(`log-${node.id}`, async () => {
        const getNestedValue = (obj: any, p: string): any => {
            return p.split(".").reduce((acc, key) => acc?.[key], obj);
        };

        const compiledMessage = message ? compileTemplate(message, context) : "";

        // Gather data from sources
        const logData: Record<string, any> = {};
        if (sources && Array.isArray(sources)) {
            for (const src of sources) {
                logData[src] = getNestedValue(context, src);
            }
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: compiledMessage,
            data: Object.keys(logData).length > 0 ? logData : undefined,
        };

        // Log based on level
        switch (level) {
            case "debug": console.debug("[WORKFLOW]", logEntry); break;
            case "warn": console.warn("[WORKFLOW]", logEntry); break;
            case "error": console.error("[WORKFLOW]", logEntry); break;
            default: console.log("[WORKFLOW]", logEntry);
        }

        const updatedContext: WorkflowContext = { ...context };
        const resultKey = variableName || node.id;
        updatedContext[resultKey] = { success: true, logged: logEntry };
        return updatedContext;
    });
};

/**
 * VALIDATE NODE
 * Validate data against rules
 */
export const validateExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        source,          // Data to validate
        rules,           // Array of {field, rule, value, message}
        failOnError = true,
        variableName
    } = node.data || {};

    return step.run(`validate-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceData = source ? getNestedValue(context, source) : context;
            const errors: string[] = [];

            if (rules && Array.isArray(rules)) {
                for (const rule of rules) {
                    const fieldValue = rule.field ? getNestedValue(sourceData, rule.field) : sourceData;
                    let isValid = true;

                    switch (rule.rule) {
                        case "required":
                            isValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
                            break;
                        case "type":
                            isValid = typeof fieldValue === rule.value;
                            break;
                        case "minLength":
                            isValid = String(fieldValue).length >= Number(rule.value);
                            break;
                        case "maxLength":
                            isValid = String(fieldValue).length <= Number(rule.value);
                            break;
                        case "min":
                            isValid = Number(fieldValue) >= Number(rule.value);
                            break;
                        case "max":
                            isValid = Number(fieldValue) <= Number(rule.value);
                            break;
                        case "pattern":
                            isValid = new RegExp(rule.value).test(String(fieldValue));
                            break;
                        case "email":
                            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fieldValue));
                            break;
                    }

                    if (!isValid) {
                        errors.push(rule.message || `Validation failed: ${rule.field} ${rule.rule}`);
                    }
                }
            }

            const isValid = errors.length === 0;

            if (!isValid && failOnError) {
                throw new Error(errors.join("; "));
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, isValid, errors };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, isValid: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * COMPARE NODE
 * Compare two values and return boolean result
 */
export const compareExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        left,            // Left operand (context path or value)
        operator,        // "eq", "ne", "gt", "lt", "gte", "lte", "contains", "startsWith", "endsWith"
        right,           // Right operand
        variableName
    } = node.data || {};

    return step.run(`compare-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const leftVal = left?.startsWith?.("{{")
                ? compileTemplate(left, context)
                : (typeof left === "string" && left.includes(".") ? getNestedValue(context, left) : left);

            const rightVal = right?.startsWith?.("{{")
                ? compileTemplate(right, context)
                : right;

            let result: boolean;

            switch (operator) {
                case "eq": result = leftVal == rightVal; break;
                case "ne": result = leftVal != rightVal; break;
                case "gt": result = Number(leftVal) > Number(rightVal); break;
                case "lt": result = Number(leftVal) < Number(rightVal); break;
                case "gte": result = Number(leftVal) >= Number(rightVal); break;
                case "lte": result = Number(leftVal) <= Number(rightVal); break;
                case "contains": result = String(leftVal).includes(String(rightVal)); break;
                case "startsWith": result = String(leftVal).startsWith(String(rightVal)); break;
                case "endsWith": result = String(leftVal).endsWith(String(rightVal)); break;
                case "regex": result = new RegExp(String(rightVal)).test(String(leftVal)); break;
                default: result = leftVal === rightVal;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, result, left: leftVal, right: rightVal };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

/**
 * AGGREGATE NODE
 * Calculate aggregates on arrays (sum, avg, min, max, count)
 */
export const aggregateExecutor: NodeExecutor = async ({ node, context, step }) => {
    const {
        source,          // Array source path
        operation,       // "sum", "avg", "min", "max", "count", "concat"
        field,           // Optional field for object arrays
        variableName
    } = node.data || {};

    return step.run(`aggregate-${node.id}`, async () => {
        try {
            const getNestedValue = (obj: any, p: string): any => {
                return p.split(".").reduce((acc, key) => acc?.[key], obj);
            };

            const sourceArr = source ? getNestedValue(context, source) : [];
            if (!Array.isArray(sourceArr)) {
                throw new Error("Source must be an array");
            }

            const values = field
                ? sourceArr.map(item => Number(item[field]) || 0)
                : sourceArr.map(item => Number(item) || 0);

            let result: any;

            switch (operation) {
                case "sum": result = values.reduce((a, b) => a + b, 0); break;
                case "avg": result = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
                case "min": result = Math.min(...values); break;
                case "max": result = Math.max(...values); break;
                case "count": result = sourceArr.length; break;
                case "concat":
                    result = field
                        ? sourceArr.map(item => item[field]).join(", ")
                        : sourceArr.join(", ");
                    break;
                default: result = values;
            }

            const updatedContext: WorkflowContext = { ...context };
            const resultKey = variableName || node.id;
            updatedContext[resultKey] = { success: true, value: result, count: sourceArr.length };
            return updatedContext;
        } catch (error: any) {
            const updatedContext: WorkflowContext = { ...context };
            updatedContext[node.id] = { success: false, error: error.message };
            return updatedContext;
        }
    });
};

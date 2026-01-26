import Handlebars from "handlebars";
import { WorkflowContext } from "./types";

/**
 * Register JSON helper for stringifying objects in templates
 * Usage: {{json myObject}}
 */
Handlebars.registerHelper("json", (context: any) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});

/**
 * Compile a template string with workflow context
 * Supports Handlebars syntax: {{variableName.property}}
 * 
 * @param template - Template string with Handlebars expressions
 * @param context - Workflow context containing node outputs
 * @returns Compiled string with values substituted
 * 
 * @example
 * compileTemplate("Hello {{user.name}}", { user: { name: "John" } })
 * // Returns: "Hello John"
 * 
 * @example
 * compileTemplate("{{json httpResult}}", { httpResult: { data: { id: 1 } } })
 * // Returns: '{ "data": { "id": 1 } }'
 */
export function compileTemplate(template: string, context: WorkflowContext): string {
    if (!template) return "";

    try {
        const compiled = Handlebars.compile(template);
        return compiled(context);
    } catch (error) {
        console.error("Template compilation failed:", error);
        return template; // Return original on error
    }
}

/**
 * Compile a JSON body string with workflow context
 * Handles both template compilation and JSON parsing
 * 
 * @param body - JSON string that may contain Handlebars expressions
 * @param context - Workflow context
 * @returns Parsed JSON object or undefined if empty/invalid
 */
export function compileJsonBody(body: string | undefined, context: WorkflowContext): any {
    if (!body || body.trim() === "") return undefined;

    try {
        const compiled = compileTemplate(body, context);
        return JSON.parse(compiled);
    } catch (error) {
        console.error("JSON body compilation/parsing failed:", error);
        return undefined;
    }
}

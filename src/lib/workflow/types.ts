export type WorkflowContext = Record<string, any>;

export interface NodeExecutorParams {
    node: any;
    context: WorkflowContext;
    step: any; // Inngest step tools
}

export type NodeExecutor = (params: NodeExecutorParams) => Promise<WorkflowContext>;

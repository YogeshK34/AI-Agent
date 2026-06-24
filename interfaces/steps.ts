/*eslint-disable*/

interface ToolCall {
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
}

interface ToolResult {
    toolCallId: string;
    toolName: string;
    result: Record<string, any>;
}

export interface AgentStep {
    stepType: 'initial' | 'tool-result';
    text?: string;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
}
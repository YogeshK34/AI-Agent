/*eslint-disable*/
"use client";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { AgentStep } from "./../interfaces/steps"

export default function UserPrompt() {
    const [prompt, setPrompt] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const sendPrompt = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/agent', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error();
            };

            const data = await response.json();
            console.log(data.steps);
            setResult(data.finalAnswer);
            setAgentSteps(data.steps);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Label>Enter you&apos;re prompt here: </Label>
            <Input
                type='text'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <button onClick={sendPrompt} disabled={loading}>Submit</button>

            {loading && (
                <>
                    <Spinner />
                </>
            )}

            {result && (
                <>
                    <Label>Agent returned: </Label>
                    <Label>{result}</Label>

                    <Label>Steps LLM Took:</Label>
                    {agentSteps.map((step, index) => (
                        <div key={index}>
                            <p><strong>Step {index + 1} — {step.stepType}</strong></p>

                            {step.toolCalls?.map((call) => (
                                <div key={call.toolCallId}>
                                    <p>🔧 Called tool: <code>{call.toolName}</code></p>
                                    <p>Args: {JSON.stringify(call.args)}</p>
                                </div>
                            ))}

                            {step.toolResults?.map((res) => (
                                <div key={res.toolCallId}>
                                    <p>✅ Result: {JSON.stringify(res.result)}</p>
                                </div>
                            ))}

                            {step.text && <p>💬 {step.text}</p>}
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}
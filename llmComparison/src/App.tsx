import "./App.css";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState } from "react";

import LLM_SERVICES from "./model.json";

function App() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState({});

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newResponses: { [key: string]: any } = {};

    for (const [llmName, llmInfo] of Object.entries(LLM_SERVICES)) {
      try {
        const startTime = performance.now();

        var response = {};
        if (llmName === "gpt-4o-mini" || llmName === "plamo") {
          response = await openaiRequest(
            llmInfo.url,
            llmInfo.model,
            llmInfo.apiKey,
            prompt
          );
        } else if (llmName === "gemini-1.5-flash") {
          response = await geminiRequest(llmInfo.url, prompt);
        }

        const endTime = performance.now();

        const responseTime = `${(endTime - startTime).toFixed(2)}ms`;

        console.log(`Response time for ${llmName}: ${responseTime}`);
        console.log(response);

        newResponses[llmName] = {
          response: response || "No response text found",
          responseTime: responseTime || "No response time found",
        };
      } catch (error) {
        newResponses[llmName] = `Error: ${(error as any).message}`;
      }
    }

    setResponses(newResponses);
  };

  const [showCardTitle, setShowCardTitle] = useState(true);

  const handleToggleCardTitle = () => {
    setShowCardTitle(!showCardTitle);
  };

  return (
    <>
      <h1>LLM Comparison Tool</h1>

      <form onSubmit={handleSubmit}>
        {/* <form> */}
        <label>
          Enter your prompt:
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>

      <h2>Responses</h2>
      <Button onClick={handleToggleCardTitle}>
        {showCardTitle ? "モデル名表示" : "モデル名非表示"}
      </Button>
      <div className="responses">
        {Object.entries(responses).map(([llmName, response]) => (
          <Card>
            <CardHeader>
              {showCardTitle && <CardTitle>{llmName}</CardTitle>}
            </CardHeader>
            <CardContent>
              <CardDescription>
                <p>Response time: {(response as any).responseTime}</p>
                <pre>{(response as any).response}</pre>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

async function openaiRequest(url: any, model: any, apiKey: any, prompt: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      //cors設定
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  var message = await response.json();
  return message.choices[0].message.content;
}

async function geminiRequest(url: any, prompt: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  var message = await response.json();
  console.log(message);

  return message.candidates[0].content.parts[0].text;
}

export default App;

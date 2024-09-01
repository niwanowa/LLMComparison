import "./App.css";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AwsClient } from "aws4fetch";

import { useState } from "react";

import LLM_SERVICES from "./model.json";

function App() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState({});

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newResponses: { [key: string]: any } = {};

    const shuffledLLMServices = Object.entries(LLM_SERVICES).sort(
      () => Math.random() - 0.5
    );

    for (const [llmName, llmInfo] of shuffledLLMServices) {
      // Rest of the code
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
        } else if (llmName === "Claude 3.5 Sonnet") {
          response = await awsRequest(
            llmInfo.url,
            llmInfo.model,
            llmInfo.accessKey,
            llmInfo.secretKey,
            prompt
          );
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

async function awsRequest(
  url: any,
  model: any,
  accessKey: any,
  secretKey: any,
  prompt: any
) {
  const cfAccountId = "770b88cf8f6822007b17d026e8c92b5a";
  const gatewayName = "bedrock";
  const region = "ap-northeast-1";

  const requestData = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const stockUrl = new URL(url);

  const awsClient = new AwsClient({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: "ap-northeast-1",
    service: "bedrock",
  });

  const presignedRequest = await awsClient.sign(stockUrl.toString(), {
    method: "POST",
    headers: headers,
    body: JSON.stringify(requestData),
  });

  const stockUrlSigned = new URL(presignedRequest.url);
  stockUrlSigned.host = "gateway.ai.cloudflare.com";
  stockUrlSigned.pathname = `/v1/${cfAccountId}/${gatewayName}/aws-bedrock/bedrock-runtime/${region}/model/${model}/invoke`;

  const response = await fetch(stockUrlSigned, {
    method: "POST",
    headers: presignedRequest.headers,
    body: JSON.stringify(requestData),
  });

  var message = await response.json();
  console.log(message);

  return message.content[0].text;
}

export default App;

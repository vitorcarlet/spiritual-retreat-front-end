/**
 * jest.polyfills.js
 *
 * Configuração de polyfills para MSW e Fetch API no ambiente de teste (JSDOM/Node).
 * A ORDEM É CRÍTICA: Dependências do Undici devem vir antes do próprio Undici.
 */

// 1. Utilitários de texto (Node nativo)
const { TextEncoder, TextDecoder } = require("node:util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Worker Threads (CRÍTICO: Undici precisa disso definido ANTES de ser carregado)
const {
  MessageChannel,
  MessagePort,
  BroadcastChannel,
} = require("node:worker_threads");
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;
global.BroadcastChannel = BroadcastChannel;

// 3. Streams (Node nativo) - Essencial para o Undici
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require("node:stream/web");

global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;

// 4. Blob (Node nativo)
const { Blob } = require("node:buffer");
global.Blob = Blob;

// 5. Performance
const { performance, PerformanceObserver } = require("node:perf_hooks");
global.performance = performance;
global.PerformanceObserver = PerformanceObserver;

// 6. AbortController (Geralmente global no Node 15+, mas garantindo)
if (typeof global.AbortController === "undefined") {
  const { AbortController, AbortSignal } = require("node:abort-controller");
  global.AbortController = AbortController;
  global.AbortSignal = AbortSignal;
}

// 7. Fetch API (Undici)
// Só importamos o undici depois de garantir que Streams, MessagePort e Blob existem.
const { fetch, Headers, Request, Response, FormData } = require("undici");

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.FormData = FormData;

// 8. StructuredClone (Cópia profunda)
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

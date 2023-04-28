import { context, trace } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

const N = 10_000;

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
});
sdk.start();

const tracer = trace.getTracer("example-tracer-node");
tracer.startActiveSpan("main", (span) => {
  for (let i = 0; i < N; i++) {
    const globalCtx = context.active();
    const ctx = trace.setSpan(globalCtx, span);
    tracer.startActiveSpan("child", undefined, ctx, (childSpan) => {
      // Do stuff
      console.log("doing stuff", i);
      childSpan.end();
    });
  }
  span.end();
});

await sdk.shutdown();
console.log("finished");

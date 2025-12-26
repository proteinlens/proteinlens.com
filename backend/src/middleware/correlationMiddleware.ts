/**
 * Correlation Middleware - W3C Trace Context extraction and propagation
 * Feature 011: Observability
 * 
 * Implements W3C Trace Context standard (traceparent header)
 * Falls back to X-Correlation-Id for legacy clients
 * Ensures consistent tracing across frontend → backend → Azure services
 */

import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';

/**
 * W3C Trace Context structure
 * Format: version-traceId-spanId-flags
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
export interface TraceContext {
  /** Trace ID (32 hex chars) - identifies the entire trace */
  traceId: string;
  /** Span ID (16 hex chars) - identifies this specific request */
  spanId: string;
  /** Trace flags (01 = sampled) */
  sampled: boolean;
  /** Full traceparent header value */
  traceparent: string;
  /** Optional tracestate for vendor-specific data */
  tracestate?: string;
  /** Fallback correlation ID if no traceparent */
  correlationId: string;
}

/**
 * Generate a random hex string of specified length
 */
function randomHex(length: number): string {
  const bytes = Math.ceil(length / 2);
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

/**
 * Parse W3C traceparent header
 * Format: version-traceId-spanId-flags
 */
function parseTraceparent(header: string): Partial<TraceContext> | null {
  // traceparent: 00-traceId(32)-spanId(16)-flags(2)
  const regex = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i;
  const match = header.match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, version, traceId, spanId, flags] = match;
  
  // Only support version 00
  if (version !== '00') {
    return null;
  }
  
  return {
    traceId,
    spanId,
    sampled: (parseInt(flags, 16) & 0x01) === 1,
  };
}

/**
 * Generate new trace context
 */
function generateTraceContext(): TraceContext {
  const traceId = randomHex(32);
  const spanId = randomHex(16);
  const sampled = true;
  const traceparent = `00-${traceId}-${spanId}-${sampled ? '01' : '00'}`;
  
  return {
    traceId,
    spanId,
    sampled,
    traceparent,
    correlationId: traceId,
  };
}

/**
 * Extract trace context from incoming request headers
 * Priority: traceparent > X-Correlation-Id > generate new
 */
export function extractTraceContext(request: HttpRequest): TraceContext {
  // Try W3C traceparent first
  const traceparentHeader = request.headers.get('traceparent');
  if (traceparentHeader) {
    const parsed = parseTraceparent(traceparentHeader);
    if (parsed && parsed.traceId && parsed.spanId) {
      // Generate new span ID for this leg of the trace
      const newSpanId = randomHex(16);
      const sampled = parsed.sampled ?? true;
      
      return {
        traceId: parsed.traceId,
        spanId: newSpanId,
        sampled,
        traceparent: `00-${parsed.traceId}-${newSpanId}-${sampled ? '01' : '00'}`,
        tracestate: request.headers.get('tracestate') ?? undefined,
        correlationId: parsed.traceId,
      };
    }
  }
  
  // Fallback to X-Correlation-Id
  const correlationId = request.headers.get('x-correlation-id') ?? request.headers.get('X-Correlation-Id');
  if (correlationId) {
    // Use correlation ID as trace ID if it's a valid UUID or hex string
    const traceId = correlationId.replace(/-/g, '').slice(0, 32).padEnd(32, '0');
    const spanId = randomHex(16);
    
    return {
      traceId,
      spanId,
      sampled: true,
      traceparent: `00-${traceId}-${spanId}-01`,
      correlationId,
    };
  }
  
  // No trace context found, generate new
  return generateTraceContext();
}

/**
 * Add trace context headers to outgoing response
 */
export function addTraceContextHeaders(
  headers: Record<string, string>,
  context: TraceContext
): Record<string, string> {
  return {
    ...headers,
    'traceparent': context.traceparent,
    'X-Correlation-Id': context.correlationId,
    ...(context.tracestate ? { 'tracestate': context.tracestate } : {}),
  };
}

/**
 * Attach trace context to Azure Functions invocation context
 * This makes it available to Application Insights automatic instrumentation
 */
export function attachToInvocationContext(
  invocationContext: InvocationContext,
  traceContext: TraceContext
): void {
  // Store in context for use by other functions
  (invocationContext as unknown as Record<string, unknown>).traceContext = traceContext;
  
  // Set operation properties for Application Insights
  // These will be automatically picked up by the SDK
  const operationId = traceContext.traceId;
  const parentId = traceContext.spanId;
  
  // Log the correlation for debugging (will be captured by App Insights)
  invocationContext.log(`[Correlation] TraceId: ${operationId}, SpanId: ${parentId}`);
}

/**
 * Get trace context from invocation context (if attached)
 */
export function getTraceContextFromInvocation(
  invocationContext: InvocationContext
): TraceContext | undefined {
  return (invocationContext as unknown as Record<string, TraceContext>).traceContext;
}

/**
 * Correlation middleware function
 * Extracts trace context and adds response headers
 */
export function correlationMiddleware(
  request: HttpRequest,
  invocationContext: InvocationContext
): {
  traceContext: TraceContext;
  addResponseHeaders: (response: HttpResponseInit) => HttpResponseInit;
} {
  // Extract or generate trace context
  const traceContext = extractTraceContext(request);
  
  // Attach to invocation context for App Insights
  attachToInvocationContext(invocationContext, traceContext);
  
  // Return helper to add headers to response
  return {
    traceContext,
    addResponseHeaders: (response: HttpResponseInit): HttpResponseInit => {
      const headers = response.headers ?? {};
      const headersObj = headers instanceof Headers 
        ? Object.fromEntries(headers.entries())
        : headers as Record<string, string>;
      
      return {
        ...response,
        headers: addTraceContextHeaders(headersObj, traceContext),
      };
    },
  };
}

/**
 * Create headers for outgoing HTTP requests to propagate trace context
 */
export function createOutgoingHeaders(
  traceContext: TraceContext,
  additionalHeaders?: Record<string, string>
): Record<string, string> {
  return {
    ...additionalHeaders,
    'traceparent': traceContext.traceparent,
    'X-Correlation-Id': traceContext.correlationId,
    ...(traceContext.tracestate ? { 'tracestate': traceContext.tracestate } : {}),
  };
}

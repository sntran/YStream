# YStream

Transform streams for encoding and decoding yEnc

## Usage

```typescript
import { YEncDecoderStream, YEncEncoderStream } from "./ystream.ts";
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

// Standalone
const encoded = new YEncEncoderStream().transform(charArray);
const decoded = new YEncDecoderStream().transform(encoded);

assertEquals(decoded, charArray);

// Streaming
const response = await fetch("https://example.com");
response.body
  .pipeThrough(new YEncEncoderStream())
  .pipeThrough(new YEncDecoderStream());
```

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
import { readableStreamFromIterable } from "https://deno.land/std@0.138.0/streams/conversion.ts";
import fc from "https://cdn.skypack.dev/fast-check";

import { YEncDecoderStream, YEncEncoderStream } from "./ystream.ts";

Deno.test("transform", () => {
  fc.assert( // run the property several times (in other words execute the test)
    fc.property( // define the property: arbitrary and what should be observed (predicate)
      fc.uint8Array(), // arbitraries
      (charArray: Uint8Array): void => {
        const encoder = new YEncEncoderStream();
        const decoder = new YEncDecoderStream();

        const encoded = encoder.transform(charArray);
        const decoded = decoder.transform(encoded);

        assertEquals(decoded, charArray);
      },
    ),
    {
      verbose: true,
    },
  );
});

Deno.test("stream", () => {
  fc.assert(
    fc.asyncProperty(
      fc.uint8Array(),
      async (charArray: Uint8Array) => {
        const outputStream = readableStreamFromIterable([charArray])
          .pipeThrough(new YEncEncoderStream())
          .pipeThrough(new YEncDecoderStream());

        // The quicky way to read all data from a stream.
        const buffer = await new Response(outputStream).arrayBuffer();
        const decoded = new Uint8Array(buffer);
        assertEquals(decoded, charArray);
      },
    ),
    {
      verbose: true,
    },
  );
});

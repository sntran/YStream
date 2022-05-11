const NULL = 0;
const LF = 10;
const CR = 13;
const ESCAPE = "=".charCodeAt(0);

class YStream extends TransformStream {
  constructor(
    writableStrategy?: QueuingStrategy,
    readableStrategy?: QueuingStrategy,
  ) {
    const transformer: Transformer<Uint8Array> = {
      transform: (chunk, controller) => {
        controller.enqueue(this.transform(chunk));
      },
    };

    super(transformer, writableStrategy, readableStrategy);
  }

  get encoding() {
    return "yenc";
  }

  transform(_chunk: Uint8Array): Uint8Array {
    throw new Error("Method not implemented.");
  }
}

export class YEncEncoderStream extends YStream {
  /**
   * Encodes.
   */
  transform(chunk: Uint8Array): Uint8Array {
    if (!chunk.length) return chunk;

    const charArray = [];

    /** Fetches a character from the input stream. */
    for (const byte of chunk) {
      /** Increments the character's ASCII value by 42, modulo 256 */
      const encoded = (byte + 42) % 256;

      /** If the result is a critical character, */
      if (
        encoded === NULL ||
        encoded === LF ||
        encoded === CR ||
        encoded === ESCAPE
      ) {
        charArray.push(
          /** writes the escape character to the output stream */
          ESCAPE,
          /** and increments character's ASCII value by 64, modulo 256 */
          (encoded + 64) % 256,
        );
      } else {
        charArray.push(encoded);
      }
    }

    return new Uint8Array(charArray);
  }
}

export class YEncDecoderStream extends YStream {
  /**
   * Decodes
   */
  transform(chunk: Uint8Array): Uint8Array {
    if (!chunk.length) return chunk;

    const output = new Uint8Array(chunk.length);

    const offset = 42; // default yEnc offset

    let escaped = false,
      byteIndex = 0,
      byte;

    const offsetReverse = 256 - offset;

    for (let i = 0; i < chunk.length; i++) {
      byte = chunk[i];

      if (byte === 61 && !escaped) {
        escaped = true;
        continue;
      }

      if (escaped) {
        escaped = false;
        byte -= 64;
      }

      output[byteIndex++] = byte < offset && byte > 0
        ? byte + offsetReverse
        : byte - offset;
    }

    return output.subarray(0, byteIndex);
  }
}

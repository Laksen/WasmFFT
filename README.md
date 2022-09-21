# WasmFFT

Pretty fast and compact SIMD WebAssembly FFT implementation

All handwritten to experiment with the performance of SIMD WebAssembly. It seems to be performing quite well compared to other FFT implementations for WebAssembly.

## Limitations

- Hardcoded to use Float32's. Focus is on performance, not precision.
- Inverse transforms not supported.
- Non-interleaved complex input not supported.

## Roadmap

- Support for window functions.
- Support for scaling.

## "Building"

To compile the WebAssembly use WABT:

```
wat2wasm fft.wat
```

## Using

Example:
```js
await getFFT(256, "complex", "complex").then(transform => {
    // Complex input is interleaved real/imag pairs, real input is a flat array of real values.
    var input = transform.getInputBuffer();
    // For complex outputs an array of Float32Arrays will be output. For real output (magsqr) only a single Float32Array wil be returned.
    var [outputReal, outputImag] = transform.getOutputBuffer();

    // Write input
    for (var i = 0; i < transform.points; i++) {
        // Input is interleaved when using complex input
        input[2 * i + 0] = Math.cos(i / 5);
        input[2 * i + 1] = Math.sin(i / 5);
    }

    // Run transform
    transform.run();

    // Do something with outputs
    for (var i = 0; i < transform.points; i++) {
        // Input is interleaved when using complex input
        console.log(i, outputReal[i], outputImag[i]);
    }
});
```

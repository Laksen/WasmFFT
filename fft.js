// Copyright (C) 2022 Jeppe Johansen - jeppe@j-software.dk
class FFTWasmImpl {
    #memory;
    #run;

    #inputBuffer;
    #realOut;
    #workingBufferR;
    #workingBufferI;

    points = 0;

    /**
     * 
     * @param {Number} points 
     * @param {WebAssembly.WebAssemblyInstantiatedSource} wasmModule
     */
    constructor(points, realOut, wasmModule) {
        this.points = points;
        this.#realOut = realOut;

        this.#memory = wasmModule.instance.exports.memory;
        this.#run = wasmModule.instance.exports.run;

        let [outpR, outpI] = wasmModule.instance.exports.getOutputBuffers();
        let inp = wasmModule.instance.exports.getInputBuffer();

        this.#inputBuffer = new Float32Array(this.#memory.buffer, inp, points * 2);
        this.#workingBufferR = new Float32Array(this.#memory.buffer, outpR, points);
        this.#workingBufferI = new Float32Array(this.#memory.buffer, outpI, points);
    }

    /**
     * Get the input buffer. The formatting of data depends on what settings the FFT was initialized with. Real input will be an array
     * of `points` Float32's. Complex input will be an `Float32Array` with `points` `Float32` I/Q pairs interleaved.
     * @returns {Float32Array} Input buffer
     */
    getInputBuffer() {
        return this.#inputBuffer
    }

    /**
     * Get output buffer(s)
     * @returns {Array<Float32Array> | Float32Array} Separate I/Q arrays, or single magnitude square array
     */
    getOutputBuffer() {
        if (this.#realOut)
            return this.#workingBufferR;
        else
            return [this.#workingBufferR, this.#workingBufferI];
    }

    /**
     * Run a single FFT transform.
     */
    run() {
        this.#run();
    }
}

/**
 * 
 * @param {Number} points Number of points in FFT
 * @param {String} inputType Type of inputs. Can be "real" or "complex".
 * @param {String} outputType Type of output. Can be "magsqr" or "complex". "magsqr" returns an array of Float32 containing |Fi]^2
 * @returns {Promise<FFTWasmImpl>}
 */
async function getFFT(points, inputType = "complex", outputType = "complex", wasmPath = "/fft.wasm") {
    const importObject = {
        Math: Math,
        config: {
            points: points,
            inputType:  {"complex": 0, "real": 1}[inputType],
            outputType: {"magsqr": 0, "complex": 1}[outputType]
        }
    };

    return await fetch(wasmPath).then(async resp => {
        return await WebAssembly.instantiate(await resp.arrayBuffer(), importObject).then((obj) => {
            return new FFTWasmImpl(points, outputType != "complex", obj);
        });
    });
}

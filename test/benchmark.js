
async function main() {
    for (var b = 6; b <= 14; b++) {
        const sz = 1 << b;

        await getFFT(1 << b, "complex", "complex").then(f => {
            var inp = f.getInputBuffer();
            var [or, oi] = f.getOutputBuffer();

            for (var i = 0; i < f.points; i++) {
                inp[2 * i + 0] = Math.cos(i / 10);
                inp[2 * i + 1] = Math.sin(i / 10);
            }

            // Warmup
            for (var i = 0; i < 1000; i++) {
                f.run();
            }

            // Run simple benchmark
            let cnt = 0;
            let iters = 500;
            var start = performance.now();
            while ((performance.now() - start) < 1000) {
                for (var i = 0; i < iters; i++) {
                    f.run();
                }
                cnt += iters;
            }
            var stop = performance.now();

            document.getElementById("result").innerHTML += "<tr><td>" + sz  + "</td><td>" + (cnt / ((stop - start) / 1000)).toFixed(1) + "</td><td>" + ((f.points * cnt / ((stop - start) / 1000)) / 1e6).toFixed(1) + "</td></tr>";
        });
    }
}
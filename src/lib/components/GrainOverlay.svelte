<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    let canvasRef: HTMLCanvasElement;
    let animationId: number;

    onMount(() => {
        if (!browser || !canvasRef) return;

        const ctx = canvasRef.getContext("2d");
        if (!ctx) return;

        let w: number, h: number;

        const resize = () => {
            w = canvasRef.width = window.innerWidth;
            h = canvasRef.height = window.innerHeight;
        };

        const loop = () => {
            if (!ctx) return;

            // Clear with transparency
            ctx.clearRect(0, 0, w, h);

            // Draw noise
            const imageData = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(imageData.data.buffer);
            const len = buffer32.length;

            for (let i = 0; i < len; i++) {
                if (Math.random() < 0.1) {
                    // 10% density
                    // Random grey value with low alpha
                    const val = Math.random() * 255;
                    // ABGR format (little-endian)
                    // Alpha = 20 (approx 0.08)
                    buffer32[i] = (20 << 24) | (val << 16) | (val << 8) | val;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Slow down the frame rate for "film" look (optional, here running full speed)
            animationId = requestAnimationFrame(loop);
        };

        window.addEventListener("resize", resize);
        resize();
        loop();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    });
</script>

<canvas
    bind:this={canvasRef}
    class="fixed inset-0 z-[9990] pointer-events-none opacity-40 mix-blend-overlay"
></canvas>

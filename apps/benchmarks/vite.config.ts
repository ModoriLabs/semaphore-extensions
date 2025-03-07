import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import topLevelAwait from "vite-plugin-top-level-await"
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), topLevelAwait()],
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
            define: {
                global: "globalThis"
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                    process: true
                })
            ]
        }
    },
    resolve: {
        alias: {
            process: "process/browser",
            stream: "stream-browserify",
            zlib: "browserify-zlib",
            util: "util"
        }
    }
})

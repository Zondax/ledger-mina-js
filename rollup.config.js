const { default: esbuild } = require("rollup-plugin-esbuild");

const config = [
  // Node.js build (CommonJS)
  {
    input: `src/index.ts`,
    plugins: [esbuild()],
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
  },
  // Web build (ESM)
  {
    input: `src/index.ts`,
    plugins: [esbuild()],
    output: [
      {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: true,
      },
    ],
  },
  // Browser build (UMD)
  {
    input: `src/index.ts`,
    plugins: [esbuild()],
    output: [
      {
        file: "dist/index.browser.js",
        format: "umd",
        name: "MinaLedger",
        sourcemap: true,
        globals: {
          "@zondax/ledger-js": "LedgerJS",
        },
      },
    ],
  },
];

module.exports = config;

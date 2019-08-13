import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/worker.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'worker',
		file: 'docs/worker.js'
	},
	plugins: [
		json({
      preferConst: true, // Default: false
      indent: '  ',
      compact: true, // Default: false
    }),
		svelte({
			// enable run-time checks when not in production
			dev: !production,
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

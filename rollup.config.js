import { defineConfig } from 'rollup';


export default defineConfig({
	input: {
		freak: './src/index.js',
		jsx: './src/jsx-runtime.js',
	},
	output: [
		{
			format: 'cjs',
			dir: './dist',
			entryFileNames: '[name].js',
			chunkFileNames: '_[name].js',
		},
		{
			format: 'esm',
			dir: './dist',
			entryFileNames: '[name].mjs',
			chunkFileNames: '_[name].mjs',
		},
	],
});

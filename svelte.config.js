import path from 'path';
import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import { normalizePath } from 'vite';

const config = {
	preprocess: [preprocess()],

	kit: {
		prerender: {
			enabled: false
		},
		files: {
			assets: 'static'
		},
		
		adapter: adapter({
			env: {
				headers: {
					protocol: undefined
				}
			}
		})
	}
};

export default config;

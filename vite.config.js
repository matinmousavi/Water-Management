import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	root: 'src',
	envDir: '../',
	plugins: [react()],

	build: {
		target: 'esnext',
		copyPublicDir: false,
		minify: 'esbuild',
		rollupOptions: {
			input: {
				panel: 'src/index.html',
			},
			output: {
				dir: 'dist',
			},
		},
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons'],
	},
	server: {
		watch: {
			usePolling: true,
		},
	},
})

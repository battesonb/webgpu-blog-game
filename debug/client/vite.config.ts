import {defineConfig, UserConfigExport} from 'vite';

const config: UserConfigExport = {
  base: "/webgpu-blog-game/",
  build: {
    target: "esnext",
  },
  server: {
    port: 5175,
  },
};

export default defineConfig(config);

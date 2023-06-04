import {defineConfig, UserConfigExport} from 'vite';

const config: UserConfigExport = {
  base: "/webgpu-blog-game/",
  build: {
    target: "esnext",
  },
};

export default defineConfig(config);

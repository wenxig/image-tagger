// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

// tailwind.config.ts
var tailwind_config_default = {
  corePlugins: {
    preflight: false
  },
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

// electron.vite.config.ts
import tailwindcss from "tailwindcss";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ],
    css: {
      postcss: {
        plugins: [tailwindcss(tailwind_config_default)]
      }
    }
  }
});
export {
  electron_vite_config_default as default
};

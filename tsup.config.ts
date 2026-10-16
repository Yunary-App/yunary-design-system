import { defineConfig } from 'tsup';

export default defineConfig({
  /* `chart-geometry` : la géométrie du graphique, seule, sans React (mcp-ui, Preact). v0.8.0 */
  entry: { index: 'src/index.ts', 'chart-geometry': 'src/chart/geometry.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'es2020',
  external: ['react', 'react-dom', 'lucide-react', 'tailwind-merge'],
});

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/lock-manager-card.ts',
  output: {
    file: 'dist/lock-manager-card.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    typescript(),
    terser()
  ]
};

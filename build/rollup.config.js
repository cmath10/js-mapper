import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

// noinspection JSUnusedGlobalSymbols
export default {
    input: 'src/index.ts',
    output: [{
        name: 'JsMapper',
        exports: 'named',
        sourcemap: false,
    }],
    plugins: [
        typescript({ sourceMap: false }),
        alias({ entries: [{ find: /^@\/(.+)/, replacement: './$1' }] }),
        commonjs(),
        terser(),
    ],
}

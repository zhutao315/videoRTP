import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'

export default (configs) => {
  return configs.map((config) => {
    return {
      input: config.input,
      output: {
        name: config.file,
        file: config.file,
        format: config.format || 'cjs',
        sourcemap: false,
        exports: 'named',
      },
      // 告诉rollup不要将此lodash打包，而作为外部依赖
      external: ['react', 'lodash', 'antd'],
      // 是否开启代码分割
      experimentalCodeSplitting: true,
      plugins: [
        resolve(),
        babel({
          exclude: ['node_modules/**'],
        }),
        config.env === 'prod' && uglify(),
      ],
    }
  })
}

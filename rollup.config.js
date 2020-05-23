import rollup from './rollup.base.config'

export default rollup([
  { input: 'src/index.js', file: 'lib/index.js' },
  { input: 'src/index.js', file: 'lib/index.min.js', env: 'prod' },
  { input: 'src/index.js', file: 'videoRTP.min.js', name: 'videoRTP', format: 'umd', env: 'prod' },

  { input: 'src/pressVideo.js', file: 'lib/pressVideo.js' },
  { input: 'src/pressVideo.js', file: 'lib/pressVideo.min.js', env: 'prod' },

  { input: 'src/record.js', file: 'lib/record.js' },
  { input: 'src/record.js', file: 'lib/record.min.js', env: 'prod' },
])

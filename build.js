const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'dist/bundle.js',
    minify: false,
    sourcemap: true
}).catch(() => process.exit(1));

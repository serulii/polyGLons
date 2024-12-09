module.exports = {
    ignorePatterns: ['src/polylons-wasm/*'],
    env: {
        es6: true,
        browser: true,
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react'],
};
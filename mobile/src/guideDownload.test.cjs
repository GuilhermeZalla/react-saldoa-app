const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function setup(options = {}) {
    const state = { downloads: [], saved: [], deleted: [], timers: new Set() };
    const pdf = new TextEncoder().encode('%PDF-1.7\nFictional test document');
    const destination = {
        exists: true,
        async write(bytes) {
            if (options.writeError) throw options.writeError;
            state.saved.push(bytes);
        },
        delete() {
            state.deleted.push('destination');
        },
    };
    class File {
        exists = false;
        constructor(_directory, name) {
            this.name = name;
        }
        static async downloadFileAsync(url, file, { signal }) {
            state.downloads.push(url);
            file.exists = true;
            if (options.timeout) {
                return new Promise((_, reject) =>
                    signal.addEventListener('abort', () =>
                        reject(new Error('Aborted')),
                    ),
                );
            }
            if (options.networkError) throw options.networkError;
        }
        async bytes() {
            return options.invalidPdf
                ? new TextEncoder().encode('<html>Not found</html>')
                : pdf;
        }
        delete() {
            state.deleted.push('temporary');
        }
    }
    const exports = {};
    const compiled = ts.transpileModule(
        readFileSync(require.resolve('./guideDownload.ts'), 'utf8'),
        {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022,
            },
        },
    ).outputText;
    vm.runInNewContext(compiled, {
        exports,
        AbortController,
        Date,
        setTimeout(callback, milliseconds) {
            assert.equal(milliseconds, 30_000);
            state.timers.add(callback);
            return callback;
        },
        clearTimeout(callback) {
            state.timers.delete(callback);
        },
        document: {
            createElement() {
                const link = {
                    click() {
                        state.clicked = {
                            href: link.href,
                            download: link.download,
                        };
                    },
                    remove() {
                        state.linkRemoved = true;
                    },
                };
                return link;
            },
            body: { appendChild() {} },
        },
        require(name) {
            if (name === 'react-native')
                return { Platform: { OS: options.web ? 'web' : 'android' } };
            if (name !== 'expo-file-system')
                throw new Error(`Unexpected import: ${name}`);
            state.nativeLoaded = true;
            return {
                File,
                Paths: { cache: 'file:///cache/' },
                Directory: {
                    async pickDirectoryAsync() {
                        if (options.pickerError) throw options.pickerError;
                        return {
                            createFile(name, type) {
                                state.filename = name;
                                assert.equal(type, 'application/pdf');
                                return destination;
                            },
                        };
                    },
                },
            };
        },
    });
    return { downloadGuide: exports.downloadGuide, state, pdf };
}

for (const [language, filename] of [
    ['pt-BR', 'guia-de-uso-saldoa.pdf'],
    ['en', 'use-guide-saldoa-en.pdf'],
]) {
    void test(`the ${language} mobile guide is saved with its PDF bytes and filename`, async () => {
        const { downloadGuide, state, pdf } = setup();
        assert.equal(
            await downloadGuide('https://example.com/', language),
            'saved',
        );
        assert.deepEqual(state.downloads, [
            `https://example.com/guide?lang=${language}`,
        ]);
        assert.equal(state.filename, filename);
        assert.deepEqual(state.saved, [pdf]);
        assert.deepEqual(state.deleted, ['temporary']);
        assert.equal(state.timers.size, 0);
    });
}

void test('cancelling the folder picker does not download a file or report a failure', async () => {
    const { downloadGuide, state } = setup({
        pickerError: { code: 'ERR_PICKER_CANCELLED' },
    });
    assert.equal(
        await downloadGuide('https://example.com', 'pt-BR'),
        'cancelled',
    );
    assert.deepEqual(state.downloads, []);
    assert.deepEqual(state.saved, []);
    assert.equal(state.timers.size, 0);
});

void test('folder permission errors remain errors', async () => {
    const error = new Error('Permission denied');
    const { downloadGuide, state } = setup({ pickerError: error });
    await assert.rejects(
        downloadGuide('https://example.com', 'pt-BR'),
        (reason) => reason === error,
    );
    assert.deepEqual(state.downloads, []);
});

void test('HTML error pages are rejected before creating a saved PDF', async () => {
    const { downloadGuide, state } = setup({ invalidPdf: true });
    await assert.rejects(
        downloadGuide('https://example.com', 'en'),
        /not a PDF/,
    );
    assert.equal(state.filename, undefined);
    assert.deepEqual(state.saved, []);
    assert.deepEqual(state.deleted, ['temporary']);
    assert.equal(state.timers.size, 0);
});

for (const failure of ['networkError', 'writeError']) {
    void test(`${failure} does not report success and removes incomplete files`, async () => {
        const error = new Error('Fictional failure');
        const { downloadGuide, state } = setup({ [failure]: error });
        await assert.rejects(
            downloadGuide('https://example.com', 'en'),
            (reason) => reason === error,
        );
        assert.deepEqual(state.saved, []);
        assert.deepEqual(
            state.deleted,
            failure === 'writeError'
                ? ['destination', 'temporary']
                : ['temporary'],
        );
        assert.equal(state.timers.size, 0);
    });
}

void test('a stalled download is aborted and its partial file is removed', async () => {
    const { downloadGuide, state } = setup({ timeout: true });
    const result = downloadGuide('https://example.com', 'pt-BR');
    const rejection = assert.rejects(result, /Aborted/);
    await new Promise((resolve) => setImmediate(resolve));
    [...state.timers][0]();
    await rejection;
    assert.deepEqual(state.deleted, ['temporary']);
    assert.equal(state.timers.size, 0);
});

void test('web downloads use a download link without loading the native file system', async () => {
    const { downloadGuide, state } = setup({ web: true });
    assert.equal(await downloadGuide('https://example.com', 'en'), 'started');
    assert.deepEqual(state.clicked, {
        href: 'https://example.com/guide?lang=en',
        download: 'use-guide-saldoa-en.pdf',
    });
    assert.equal(state.linkRemoved, true);
    assert.equal(state.nativeLoaded, undefined);
});

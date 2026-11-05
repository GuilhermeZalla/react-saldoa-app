const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function apiHarness(fetchResponse, { expire = false } = {}) {
    const modules = new Map();
    let activeTimers = 0;
    function load(name) {
        if (modules.has(name)) return modules.get(name);
        const exports = {};
        modules.set(name, exports);
        const source = readFileSync(require.resolve(`./${name}.ts`), 'utf8');
        const compiled = ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022,
            },
        }).outputText;
        vm.runInNewContext(compiled, {
            exports,
            Intl,
            URL,
            process,
            Error,
            SyntaxError,
            AbortController,
            __DEV__: false,
            fetch: fetchResponse,
            setTimeout: (callback) => {
                activeTimers++;
                if (expire) queueMicrotask(callback);
                return 1;
            },
            clearTimeout: () => {
                activeTimers--;
            },
            require: (specifier) => load(specifier.replace('./', '')),
        });
        return exports;
    }
    const api = load('api');
    return { ...api, timers: () => activeTimers };
}

const session = {
    apiUrl: 'https://api.example.com',
    accessToken: 'test-token',
};

void test('JSON body read failures become API errors and clear the deadline', async () => {
    const api = apiHarness(async () => ({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => {
            throw new SyntaxError('bad JSON');
        },
    }));
    await assert.rejects(
        api.apiRequest(session.apiUrl, '/auth/me'),
        (error) =>
            error instanceof api.ApiError && error.code === 'invalid_response',
    );
    assert.equal(api.timers(), 0);
});

void test('a timeout while reading the response body is translated and clears the deadline', async () => {
    const api = apiHarness(
        async (_, { signal }) => ({
            ok: true,
            text: async () => {
                if (signal.aborted) {
                    const error = new Error('aborted');
                    error.name = 'AbortError';
                    throw error;
                }
                return '';
            },
        }),
        { expire: true },
    );
    await assert.rejects(
        api.apiTextRequest(session, '/account/export'),
        (error) => error.code === 'request_timeout',
    );
    assert.equal(api.timers(), 0);
});

void test('export body interruptions become network errors and clear the deadline', async () => {
    const api = apiHarness(async () => ({
        ok: true,
        text: async () => {
            throw new Error('connection lost');
        },
    }));
    await assert.rejects(
        api.apiTextRequest(session, '/account/export'),
        (error) => error.code === 'network_error',
    );
    assert.equal(api.timers(), 0);
});

void test('HTTP authentication errors preserve status and clear the deadline', async () => {
    const api = apiHarness(async () => ({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { code: 'unauthenticated' } }),
    }));
    await assert.rejects(
        api.apiRequest(session.apiUrl, '/auth/me'),
        (error) => error.status === 401 && error.code === 'unauthenticated',
    );
    assert.equal(api.timers(), 0);
});

void test('successful exports preserve the response text and clear the deadline', async () => {
    const api = apiHarness(async () => ({
        ok: true,
        text: async () => 'date,amount\n2026-11-04,25',
    }));
    assert.equal(
        await api.apiTextRequest(session, '/transactions/export'),
        'date,amount\n2026-11-04,25',
    );
    assert.equal(api.timers(), 0);
});

async function restoreSessionWithStatus(status) {
    const saved = {
        ...session,
        user: { id: 1 },
        isDemo: false,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    const states = [];
    const effects = [];
    let stateIndex = 0;
    let deletions = 0;
    class ApiError extends Error {
        constructor(status) {
            super('request failed');
            this.status = status;
        }
    }
    const exports = {};
    const source = readFileSync(
        require.resolve('./SessionContext.tsx'),
        'utf8',
    );
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
        },
    }).outputText;
    vm.runInNewContext(compiled, {
        exports,
        require: (name) => {
            if (name === 'react')
                return {
                    createContext: () => ({ Provider: {} }),
                    useCallback: (fn) => fn,
                    useEffect: (fn) => effects.push(fn),
                    useState: (initial) => {
                        const index = stateIndex++;
                        states[index] = initial;
                        return [
                            initial,
                            (value) => {
                                states[index] = value;
                            },
                        ];
                    },
                };
            if (name === 'react/jsx-runtime')
                return { jsx: (type, props) => ({ type, props }) };
            if (name === 'react-native') return { Alert: { alert: () => {} } };
            if (name === './api')
                return {
                    ApiError,
                    sessionRequest: async () => {
                        throw new ApiError(status);
                    },
                };
            if (name === './i18n') return { t: (key) => key };
            if (name === './sessionStorage')
                return {
                    readSession: async () => saved,
                    saveSession: async () => {},
                    clearSession: async () => {
                        deletions++;
                    },
                };
            throw new Error(`Unexpected dependency: ${name}`);
        },
    });
    exports.SessionProvider({ children: null });
    effects[0]();
    await new Promise(setImmediate);
    return { saved, states, deletions };
}

void test('temporary network and server failures preserve the saved session', async () => {
    for (const status of [0, 429, 500]) {
        const result = await restoreSessionWithStatus(status);
        assert.equal(result.deletions, 0);
        assert.equal(result.states[0], result.saved);
        assert.equal(result.states[1], false);
    }
});

void test('a rejected token clears the saved session and finishes loading', async () => {
    const result = await restoreSessionWithStatus(401);
    assert.equal(result.deletions, 1);
    assert.equal(result.states[0], null);
    assert.equal(result.states[1], false);
});

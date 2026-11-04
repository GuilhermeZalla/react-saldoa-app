const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Compile the same TypeScript utilities used by Expo without another test dependency.
const modules = new Map();
function loadUtility(name) {
    if (modules.has(name)) {
        return modules.get(name);
    }
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
        __DEV__: false,
        require: (specifier) => loadUtility(specifier.replace('./', '')),
    });
    return exports;
}

const { setLocale, t } = loadUtility('i18n');
const { formatCurrency, formatDate, dateForApi } = loadUtility('format');
const { apiErrorMessage } = loadUtility('api');

void test('language changes translate navigation and interpolate names without translating user data', () => {
    setLocale('pt-BR');
    assert.equal(t('Conta'), 'Conta');
    assert.equal(t('Olá, {name}', { name: 'João' }), 'Olá, João');
    setLocale('en');
    assert.equal(t('Conta'), 'Account');
    assert.equal(t('Olá, {name}', { name: 'João' }), 'Hello, João');
    assert.equal(t('Minha categoria pessoal'), 'Minha categoria pessoal');
    assert.equal(t('Olá, {name}'), 'Hello, {name}');
});

void test('both languages retain Brazilian reais while formatting amounts and dates by locale', () => {
    setLocale('pt-BR');
    assert.match(formatCurrency('1234.56'), /R\$\s*1\.234,56/);
    assert.equal(formatDate('2026-11-04'), '04/11/2026');
    setLocale('en');
    assert.match(formatCurrency('1234.56'), /R\$\s*1,234\.56/);
    assert.equal(formatDate('2026-11-04'), '11/04/2026');
});

void test('date inputs accept the documented day-first format and reject invalid dates', () => {
    assert.equal(dateForApi('04/11/2026'), '2026-11-04');
    assert.equal(dateForApi('2026-11-04'), '2026-11-04');
    assert.equal(dateForApi('29/02/2024'), '2024-02-29');
    assert.equal(dateForApi('29/02/2026'), null);
    assert.equal(dateForApi('31/04/2026'), null);
    assert.equal(dateForApi('not a date'), null);
});

void test('API authentication, permission, throttling and server errors use the selected language', () => {
    setLocale('en');
    assert.equal(
        apiErrorMessage(null, 401, true),
        'Incorrect email or password.',
    );
    assert.equal(
        apiErrorMessage(null, 401),
        'Your session has expired. Please sign in again.',
    );
    assert.equal(
        apiErrorMessage(null, 403),
        'You do not have permission to perform this action.',
    );
    assert.equal(
        apiErrorMessage(null, 429),
        'Too many attempts. Wait a moment and try again.',
    );
    assert.equal(
        apiErrorMessage(
            { error: { message: 'Internal implementation details' } },
            500,
        ),
        'The server encountered a problem. Please try again later.',
    );
    setLocale('pt-BR');
    assert.equal(
        apiErrorMessage(null, 401, true),
        'E-mail ou senha incorretos.',
    );
});

void test('validation preserves Portuguese details and identifies invalid fields in English', () => {
    const payload = {
        error: {
            details: {
                email: ['O campo e-mail é obrigatório.'],
                password: ['O campo senha é obrigatório.'],
            },
        },
    };
    setLocale('pt-BR');
    assert.equal(
        apiErrorMessage(payload, 422),
        'O campo e-mail é obrigatório.',
    );
    setLocale('en');
    assert.equal(
        apiErrorMessage(payload, 422),
        'Check the information entered for: Email, Password.',
    );
    assert.equal(
        apiErrorMessage(null, 422),
        'Check the information you entered.',
    );
});

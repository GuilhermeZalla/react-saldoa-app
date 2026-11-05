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

void test('the current export month follows the local calendar at the UTC month boundary', () => {
    const previousTimeZone = process.env.TZ;
    process.env.TZ = 'America/Sao_Paulo';
    try {
        const exports = {};
        const source = readFileSync(require.resolve('./format.ts'), 'utf8');
        const compiled = ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022,
            },
        }).outputText;
        class FixedDate extends Date {
            constructor(...args) {
                super(...(args.length ? args : ['2026-12-01T01:30:00Z']));
            }
        }
        vm.runInNewContext(compiled, {
            exports,
            Date: FixedDate,
            require: () => ({ getLocale: () => 'pt-BR' }),
        });
        assert.equal(new FixedDate().toISOString().slice(0, 7), '2026-12');
        assert.equal(exports.currentMonth(), '2026-11');
    } finally {
        if (previousTimeZone === undefined) delete process.env.TZ;
        else process.env.TZ = previousTimeZone;
    }
});

void test('password requirements and untranslated validation keys stay understandable in both languages', () => {
    for (const [locale, shortMessage, fallback, confirmation] of [
        [
            'pt-BR',
            'A senha deve ter pelo menos 12 caracteres.',
            'Use pelo menos 12 caracteres, com maiúsculas, minúsculas, números e símbolos.',
            'A confirmação de senha não confere.',
        ],
        [
            'en',
            'Your password must contain at least 12 characters.',
            'Use at least 12 characters, including uppercase and lowercase letters, numbers and symbols.',
            'The password confirmation does not match.',
        ],
    ]) {
        setLocale(locale);
        const response = (message) => ({
            error: { details: { password: [message] } },
        });
        assert.equal(
            apiErrorMessage(
                response('O campo senha deve ter pelo menos 12 caracteres.'),
                422,
            ),
            shortMessage,
        );
        assert.equal(
            apiErrorMessage(response('string.min.value'), 422),
            fallback,
        );
        assert.equal(
            apiErrorMessage(
                response('A confirmação de senha não confere.'),
                422,
            ),
            confirmation,
        );
        assert.equal(
            apiErrorMessage(
                { error: { details: { name: ['validation.string.max'] } } },
                422,
            ),
            t('Verifique os dados informados.'),
        );
    }
});

void test('month navigation preserves year boundaries without crossing supported years', () => {
    const { shiftMonth } = loadUtility('format');
    assert.equal(shiftMonth('2026-12', 1), '2027-01');
    assert.equal(shiftMonth('2026-01', -1), '2025-12');
    assert.equal(shiftMonth('0001-01', -1), '0001-01');
    assert.equal(shiftMonth('9999-12', 1), '9999-12');
    assert.equal(shiftMonth('2028-02', 1), '2028-03');
});

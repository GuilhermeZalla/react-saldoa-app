const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

for (const [platform, path] of [
    ['mobile', './money.ts'],
    ['web', '../../resources/js/lib/money.ts'],
]) {
    const exports = {};
    const source = readFileSync(require.resolve(path), 'utf8');
    vm.runInNewContext(
        ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022,
            },
        }).outputText,
        { exports },
    );
    const { formatMoneyInput, moneyInputToDecimal, decimalToMoneyInput } =
        exports;

    void test(`${platform}: typing amounts builds cents, reais and thousands without rounding`, () => {
        let value = '';
        for (const [digit, expected] of [
            ['5', '0,05'],
            ['0', '0,50'],
            ['0', '5,00'],
            ['0', '50,00'],
            ['0', '500,00'],
            ['0', '5.000,00'],
        ]) {
            value = formatMoneyInput(value + digit);
            assert.equal(value, expected);
        }
        assert.equal(formatMoneyInput('200000'), '2.000,00');
        assert.equal(moneyInputToDecimal('9.999.999.999,99'), '9999999999.99');
    });

    void test(`${platform}: pasted amounts, deletion and empty inputs keep the correct decimal`, () => {
        assert.equal(formatMoneyInput('R$ 1.234,56'), '1.234,56');
        assert.equal(moneyInputToDecimal('1.234,56'), '1234.56');
        assert.equal(formatMoneyInput('1.234,5'), '123,45');
        assert.equal(formatMoneyInput('00005'), '0,05');
        assert.equal(formatMoneyInput(''), '');
        assert.equal(moneyInputToDecimal(''), '');
        assert.equal(formatMoneyInput('abc'), '');
        assert.equal(moneyInputToDecimal('0,00'), '0.00');
    });

    void test(`${platform}: editing existing decimal amounts preserves their value`, () => {
        for (const [amount, display, decimal] of [
            ['200', '200,00', '200.00'],
            ['1234.56', '1.234,56', '1234.56'],
            ['1.1', '1,10', '1.10'],
            ['0.01', '0,01', '0.01'],
            ['9999999999.99', '9.999.999.999,99', '9999999999.99'],
        ]) {
            assert.equal(decimalToMoneyInput(amount), display);
            assert.equal(moneyInputToDecimal(display), decimal);
        }
        assert.equal(decimalToMoneyInput('invalid'), '');
    });
}

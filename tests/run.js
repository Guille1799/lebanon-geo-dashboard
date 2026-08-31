/*
 * node tests/run.js
 *
 * No framework, no install. This repository had no tests at all, and the bugs
 * these cover were the kind that only show up on a screen: a filter
 * highlighting a locality whose own panel said it could not be analysed.
 *
 * Half of these run against the real lebanon_data_tagged.geojson rather than
 * against invented rows. A predicate that passes on three hand-made objects and
 * fails on the file it ships with has not been tested.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const LB = require('../reliability.js');

const ROOT = path.join(__dirname, '..');
let passed = 0;
const failures = [];

function check(name, fn) {
    try {
        fn();
        passed += 1;
    } catch (err) {
        failures.push(name + '\n      ' + err.message);
    }
}

function eq(actual, expected, what) {
    if (actual !== expected) {
        throw new Error((what || 'value') + ': expected ' + JSON.stringify(expected) +
            ', got ' + JSON.stringify(actual));
    }
}

function ok(value, what) {
    if (!value) throw new Error(what || 'expected a truthy value');
}

/* ---------- the predicates on their own ---------- */

check('zero population is NOT reliable', () => {
    // The bug that started this: two guards read `pop > 0 && pop < 400`, so a
    // recorded population of zero passed straight through both of them.
    eq(LB.isReliable(0), false, 'isReliable(0)');
});

check('below the threshold is not reliable, at or above it is', () => {
    eq(LB.isReliable(399), false, '399');
    eq(LB.isReliable(400), true, '400');
    eq(LB.isReliable(401), true, '401');
});

check('missing or nonsense population is not reliable', () => {
    [undefined, null, NaN, '', 'abc'].forEach((v) => {
        eq(LB.isReliable(v), false, 'isReliable(' + String(v) + ')');
    });
});

check('a regex-special search term does not throw', () => {
    // "Aanjar (Haouch Moussa)": the raw query used to reach `new RegExp` and
    // blow up with "Unterminated group".
    const rx = new RegExp('^(' + LB.escapeForRegex('Aanjar (') + ')', 'i');
    ok(rx.test('Aanjar (Haouch Moussa)'), 'the escaped prefix should still match');
});

check('escaping does not break ordinary searches', () => {
    const rx = new RegExp('^(' + LB.escapeForRegex('Beir') + ')', 'i');
    ok(rx.test('Beirut'), 'plain text should still match');
});

/* ---------- the same predicates against the file that ships ---------- */

const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'lebanon_data_tagged.geojson'), 'utf8'));
const features = geo.features;
const real = features.filter((f) => LB.isRealLocality(f.properties));

check('the file still has the 1,611 records these tests were written against', () => {
    eq(features.length, 1611, 'feature count');
});

check('non-localities are excluded: 1,545 real localities remain', () => {
    // 1,611 minus one "Conflict" pseudo-record and 65 "Litige" disputed border
    // stretches. The README used to say 1,611 districts; both halves were wrong.
    eq(real.length, 1545, 'real localities');
});

check('no disputed border stretch survives the filter', () => {
    const survivors = real.filter((f) => LB.NON_LOCALITY_NAMES.indexOf(f.properties.ADM3_EN) !== -1);
    eq(survivors.length, 0, 'non-localities that got through');
});

check('every record has a key, and the key is unique', () => {
    // Indexing by name lost one of the two "Kafr". PCODE does not collide.
    const keys = features.map((f) => LB.localityKey(f.properties));
    eq(keys.filter((k) => !k).length, 0, 'records without a key');
    eq(new Set(keys).size, features.length, 'distinct keys');
});

check('names are NOT unique, which is why the key is not the name', () => {
    const names = real.map((f) => f.properties.ADM3_EN);
    ok(new Set(names).size < names.length, 'expected at least one duplicated name');
});

check('the zero-population localities are all caught by isReliable', () => {
    const zeros = features.filter((f) => (f.properties.pop_2025_total || 0) === 0);
    ok(zeros.length > 0, 'expected the file to contain zero-population records');
    eq(zeros.filter((f) => LB.isReliable(f.properties.pop_2025_total)).length, 0,
        'zero-population records treated as reliable');
});

check('every locality with a substantive tag but too few people is caught', () => {
    // 291 of them, 18% of the file. Before the fix these were highlighted by
    // the filter while their own panel refused to analyse them.
    const substantive = features.filter((f) => {
        const t = f.properties.ai_trend_tag;
        return t && t !== 'Mixed/Other';
    });
    const unreliable = substantive.filter((f) => !LB.isReliable(f.properties.pop_2025_total));
    eq(unreliable.length, 291, 'substantive tags below the threshold');
    ok(unreliable.length / features.length > 0.17, 'sanity: that is about 18% of the file');
});

check('the eight parenthesised names are reachable by search', () => {
    const withParens = real.filter((f) => f.properties.ADM3_EN.indexOf('(') !== -1);
    eq(withParens.length, 8, 'names containing a parenthesis');
    withParens.forEach((f) => {
        const name = f.properties.ADM3_EN;
        const prefix = name.slice(0, name.indexOf('(') + 1);
        const rx = new RegExp('^(' + LB.escapeForRegex(prefix) + ')', 'i');
        ok(rx.test(name), 'should match its own prefix: ' + name);
    });
});

/* ---------- report ---------- */

if (failures.length) {
    console.log('\nFAILED ' + failures.length + ', passed ' + passed + '\n');
    failures.forEach((f) => console.log('  x ' + f));
    process.exit(1);
}
console.log('ok — ' + passed + ' checks passed');

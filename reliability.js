/*
 * reliability.js — the rules that decide what this dashboard is willing to say.
 *
 * Why this file exists.
 *
 * The population threshold used to live as a copied condition in several
 * places, and the copies had drifted. The narrative text and the model prompt
 * both checked `pop > 0 && pop < 400`; the map checked `pop < 400`; the trend
 * classifier and the map filter checked nothing at all. So on the same screen a
 * locality could be highlighted as "Working-Age Majority" by the filter while
 * its own panel said the analysis was not available.
 *
 * The `> 0` in two of those copies is worth naming, because it inverted the
 * intent. It was there to separate "no data" from "very small", but its effect
 * was that a recorded population of zero — the most extreme case there is —
 * escaped both guards. Sfenta, in Saida, has 0 inhabitants in 2025 and was
 * shown to the reader as a workforce opportunity.
 *
 * One predicate now, asked by every path. A sixth path added tomorrow asks the
 * same question instead of inventing its own version of it.
 *
 * Loads in the browser as a plain script (globals under `LB`) and in Node for
 * the tests. No dependencies, no build step.
 */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.LB = api;
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /* Below this many people the per-locality figures are too small to read as
     * a demographic profile. The number is a judgement, not a law, and it is
     * declared in one place so that changing it changes every path at once. */
    var POPULATION_THRESHOLD = 400;

    /* Names in the source file that are not localities.
     *
     * "Conflict" is a pseudo-record with PCODE "0". "Litige" is French for
     * "dispute": 65 polygons that are contested border stretches in the OCHA
     * file, not places. They were being drawn, filtered and — for eight of
     * them — labelled with a demographic archetype. Putting "Working-Age
     * Majority" on a disputed border is not a rounding error in a dashboard
     * framed around UN work. */
    var NON_LOCALITY_NAMES = ['Conflict', 'Litige'];

    function isRealLocality(props) {
        if (!props) return false;
        var name = props.ADM3_EN;
        return Boolean(name) && NON_LOCALITY_NAMES.indexOf(name) === -1;
    }

    /* True only when the locality is big enough for its figures to mean
     * something. Zero is not a special case here: zero is below the threshold,
     * so zero is unreliable. */
    function isReliable(population) {
        var n = Number(population);
        return Number.isFinite(n) && n >= POPULATION_THRESHOLD;
    }

    /* The stable key for a locality.
     *
     * Indexing by name silently overwrote duplicates: two different places are
     * called "Kafr", one in Jbeil with 423 inhabitants and one in Akkar with
     * 64. Selecting one and reloading the page gave you the other, and the
     * analysis flipped from available to unavailable with nothing to explain
     * it. ADM3_PCODE is unique across all 1,611 records in the file. */
    function localityKey(props) {
        return props && props.ADM3_PCODE ? String(props.ADM3_PCODE) : null;
    }

    /* Search text goes into a RegExp to highlight the matched prefix. Typing an
     * opening parenthesis threw "Unterminated group" inside a forEach with no
     * catch, so the dropdown stopped filling: eight localities whose names
     * carry parentheses were unreachable by search. */
    function escapeForRegex(text) {
        return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return {
        POPULATION_THRESHOLD: POPULATION_THRESHOLD,
        NON_LOCALITY_NAMES: NON_LOCALITY_NAMES,
        isRealLocality: isRealLocality,
        isReliable: isReliable,
        localityKey: localityKey,
        escapeForRegex: escapeForRegex
    };
});

#!/usr/bin/env node

/*
 * This is Simple-and-F*-dirty script to parse html files to generate json.
 * I know its dirty. shame on me!
 *
 * Usage:
 *
 *     node dept_parser.js -d mirror/prvCode_07/cityCode_000-areaCode_06-deptCode_023/
 */

var FS = require('fs'),
    Path = require('path'),
    Cheerio = require('cheerio'),
    GetOpt = require('node-getopt');

function parseTitle(obj, $, code) {
    var tr, idx, tds;
    tr = $('table tr.title');
    if (tr.length != 1) {
        console.log(tr.length);
        throw "more than one table title:" + code;
    }

    obj.title = [];
    tds = $('td', tr);
    for (idx = 0; idx < tds.length; idx++) {
        obj.title.push($(tds[idx]).text());
    }
    return tds.length;
}

function parseTrData(array, firstField, fieldsLength, $, trDom, code) {
    var idx, tds = $('td', trDom);
    var data = []

    // update row title, if needed
    if (tds.length == fieldsLength) {
        firstField = $(tds[0]).text();
    }

    if (tds.length < fieldsLength) {
        data.push(firstField);
    }

    for (idx = 0; idx < tds.length; idx++) {
        data.push($(tds[idx]).text());
    }

    data.push(code);
    array.push(data);
    return firstField;
}

/* find out each tr.data and parse its content.*/
function parseData(obj, $, fieldsLength, code) {
    var idx,
        first = "",
        trs = $('table .data');
    for (idx = 0; idx < trs.length; idx++) {
        first = parseTrData(obj.data, first, fieldsLength, $, trs[idx], code);
    }
}

function parseContent(obj, $, code) {
    title = $('.titlebox .title');

    obj.head = $('.head', title).text();
    obj.date = $('.date', title).text();

    // we should know how many fields in one row.
    length = parseTitle(obj, $, code);
    parseData(obj, $, length, code);
}

function parseFile(obj, filename, content) {
    var $ = Cheerio.load(content, {decodeEntities: false});

    // filename is matter. it contains important information
    // so we will store the information in eacn data object.
    var code = Path.basename(filename, '.html');
    parseContent(obj, $, code);
}

// -- main --
(function () {
    var getopt = new GetOpt([
        ['d' , '=ARG+'      , 'Input dir'],
        ['h' , 'help'       , 'display this help']
    ]);

    var args = getopt.bindHelp().parseSystem();
    var opts = args.options;

    if (!opts.d) {
        getopt.showHelp();
        return 1;
    }

    // store parsed data
    var obj = { data: [] }

    // iterate each file under the directory
    var dir = opts.d[0];
    var files = FS.readdirSync(dir);
    files.map(function (name) {
        var fname = dir + "/" + name;

        if (fname.match(/\.html/)) {  // only process .html file
            var f = FS.readFileSync(fname, "utf-8");
            parseFile(obj, fname, f);
        }
    });

    console.log(JSON.stringify(obj, null, 4));
})();


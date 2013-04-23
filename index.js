/*
 * fis
 * http://web.baidu.com/
 */

'use strict';

function normalize(str, defaultExt){
    var info = fis.util.stringQuote(str);
    var rest = info.rest.trim();
    var pathinfo = fis.util.ext(rest);
    if(pathinfo.dirname == '' && pathinfo.filename.indexOf(':') === -1){
        rest += ':' + rest;
    }
    if(pathinfo.ext == ''){
        rest += defaultExt;
    }
    return info.quote + rest + info.quote;
}

function analyseJs(content, file){
    var reg = /"(?:[^\\"]|\\[\s\S])+"|'(?:[^\\']|\\[\s\S])+'|\/\/[\r\n]+|\/\*[\s\S]+?\*\/|\brequire\s*\(\s*("(?:[^\\"]|\\[\s\S])+"|'(?:[^\\']|\\[\s\S])+')\s*\)/g;
    content = content.replace(reg, function(m, value){
        if(value){
            value = normalize(value, '.js');
            var info = fis.uri.getId(value, file.dirname);
            file.addRequire(info.id);
            m = 'require(' + info.quote + info.id + info.quote + ')';
        }
        return m;
    });
    //wrap
    var deps = file.requires.length ? '[\'' + file.requires.join("', '") + '\']' : '[]';
    content = 'define(\'' + file.getId() + '\', ' + deps + ', function(require, exports, module){\n\n' + content + '\n\n});';
    return content;
}

function analyseCss(content, file){
    var reg = /@require\s+('[^']+'|"[^"]+"|[^\s{}]+)[\s;]*/g;
    return content.replace(reg, function(m, value){
        value = normalize(value, '.css');
        var info = fis.uri.getId(value, file.dirname);
        file.addRequire(info.id);
        return '';
    });
}

module.exports = function(content, file, conf){
    if(file.rExt === '.js'){
        return analyseJs(content, file);
    } else if(file.rExt === '.css'){
        return analyseCss(content, file);
    }
};
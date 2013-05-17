/*
 * fis
 * http://web.baidu.com/
 */

'use strict';

function analyseJs(content, file, conf){
    var reg = /"(?:[^\\"\n\r\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\brequire\s*\(\s*("(?:[^\\"\n\r\f]|\\[\s\S])+"|'(?:[^\\'\n\r\f]|\\[\s\S])+')\s*\)/g;
    content = content.replace(reg, function(m, value){
        if(value){
            var info = fis.uri.getId(value, file.dirname);
            file.addRequire(info.id);
            m = 'require(' + info.quote + info.id + info.quote + ')';
        }
        return m;
    });
    //wrap
    if(conf.wrap === 'amd'){
//        var deps = file.requires.length ? '[\'' + file.requires.join("', '") + '\']' : '[]';
//        content = 'define(\'' + file.getId() + '\', ' + deps + ', function(require, exports, module){\n\n' + content + '\n\n});';
        content = 'define(\'' + file.getId() + '\', function(require, exports, module){\n\n' + content + '\n\n});';
    } else {
        content = '(function(){\n\n' + content + '\n\n})();';
    }
    return content;
}

function analyseCss(content, file){
    var reg = /\brequire\s+('[^']+'|"[^"]+"|[^\s{}]+)[\s;]*/g;
    return content.replace(reg, function(m, value){
        var info = fis.uri.getId(value, file.dirname);
        file.addRequire(info.id);
        return '';
    });
}

function analyseHtml(content, file){
    var reg = /<!--require\[([^\]]+)\]-->/g;
    return content.replace(reg, function(m, value){
        var info = fis.uri.getId(value, file.dirname);
        file.addRequire(info.id);
        return '';
    });
}

module.exports = function(content, file, conf){
    if(file.rExt === '.js'){
        return analyseJs(content, file, conf);
    } else if(file.rExt === '.css'){
        return analyseCss(content, file);
    } else {
        return analyseHtml(content, file);
    }
};
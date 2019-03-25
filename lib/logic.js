'use strict';

var front = require('hexo-front-matter');
var fs = require('hexo-fs');
debugger;

function subset(A, B) {
    A = A.slice();
    for (var i = 0, len = B.length; i < len; i++) {
        if (A.indexOf(B[i]) === -1) {
            return false;
        } else {
            A.splice(A.indexOf(B[i]), 1);
        }
    }
    return true;
}

let logic = function (data) {
    var log = this.log;

    if (data.layout != 'post')
        return data;
    if (!this.config.render_drafts && data.source.startsWith("_drafts/"))
        return data;


    var overwrite = true;
    if (this.config.auto_category.enable && overwrite) {
        let postStr;
        // 1. parse front matter
        var tmpPost = front.parse(data.raw);
        // 2. read old categories
        //
        // 3. generate categories from directory
        // var categories = data.slug.split('/');
        var categories = data.source.split('/');
        // 3.1 handle depth
        var depth = this.config.auto_category.depth || categories.length - 2;
        if (depth == 0) { // Uncategorized
            //tmpPost.tags = ["Uncategorized"];
            return data;
        }
        var newCategories = categories.slice(1, 1 + Math.min(depth, categories.length - 2));
        if (tmpPost.tags == null) tmpPost.tags = []
        // 3.2 prevents duplicate file changes
        if (subset(tmpPost.tags, newCategories)) return data;
        // tmpPost.tags = newCategories
        if (newCategories)
            tmpPost.tags = Array.from(new Set(tmpPost.tags.concat(newCategories)));
        // 4. process post
        postStr = front.stringify(tmpPost);
        postStr = '---\n' + postStr;
        fs.writeFile(data.full_source, postStr, 'utf-8');
        log.i("Generated: tags [%s] for post [%s]", tmpPost.tags, categories[categories.length - 1]);
    }
    return data
}



module.exports = logic;

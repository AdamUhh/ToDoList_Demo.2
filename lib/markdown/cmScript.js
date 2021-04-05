var text;
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
let EDIT_WordCount = document.querySelector('#EDIT__wordcount');
let EDIT_CharCount = document.querySelector('#EDIT__charcount');

function getTextMarkdown(obj) {
    text = obj.value;
    var parsed = reader.parse(text); // parsed is a 'Node' tree
    // You can transform parsed if you like here, otherwise ignore this comment...
    var result = writer.render(parsed); // result is a String
    document.querySelector('#buffer').innerHTML = result;

    let buffer = document.querySelector('#buffer');
    let regex = /\s+/gi;
    if (text !== '') {
        let wordCount = buffer.innerText.trim().replace(regex, ' ').split(' ').length;
        let charCount = buffer.innerText.replace(regex, '').length;
        EDIT_WordCount.innerHTML = `${wordCount} words`;
        EDIT_CharCount.innerHTML = `${charCount} chars`;
    } else {
        EDIT_WordCount.innerHTML = '0 words';
        EDIT_CharCount.innerHTML = '0 chars';
    }
}

// Whenever user presses TAB within the textbox, add a TAB Space (4 spaces)
document.querySelector('#getm').addEventListener(
    'keydown',
    function (e) {
        if (e.keyCode === 9) {
            // tab was pressed
            // get caret position/selection
            var start = this.selectionStart;
            var end = this.selectionEnd;

            var target = e.target;
            var value = target.value;

            // set textarea value to: text before caret + tab + text after caret
            target.value = value.substring(0, start) + '\t' + value.substring(end);

            // put caret at right position again (add one for the tab)
            this.selectionStart = this.selectionEnd = start + 1;

            // prevent the focus lose
            e.preventDefault();
        }
    },
    false
);

// If user presses the textarea buttons, add it accordingly to the markdown textarea
const apply = (e) => {
    let myField = document.getElementById('getm');
    let myValueBefore;
    let myValueAfter;
    switch (e) {
        case 'bold':
            myValueBefore = '**';
            myValueAfter = '**';
            break;
        case 'italic':
            myValueBefore = '*';
            myValueAfter = '*';
            break;
        case 'h1':
            myValueBefore = '# ';
            myValueAfter = '';
            break;
        case 'h2':
            myValueBefore = '## ';
            myValueAfter = '';
            break;
        case 'h3':
            myValueBefore = '### ';
            myValueAfter = '';
            break;
        case 'bq':
            myValueBefore = '> ';
            myValueAfter = '';
            break;
        case 'ol':
            myValueBefore = '1. ';
            myValueAfter = '';
            break;
        case 'ul':
            myValueBefore = '- ';
            myValueAfter = '';
            break;
        case 'checkmark':
            myValueBefore = '✓';
            myValueAfter = '';
            break;
        case 'checkmarkbad':
            myValueBefore = '✘';
            myValueAfter = '';
            break;
        case 'ic':
            myValueBefore = '`';
            myValueAfter = '`';
            break;
        case 'bc':
            myValueBefore = '```\n';
            myValueAfter = '\n```';
            break;
        case 'link':
            myValueBefore = '[Link](URL)';
            myValueAfter = '';
            break;

        case 'image':
            myValueBefore = '![altText](imageLink)';
            myValueAfter = '';
            break;
        case 'linkedImage':
            myValueBefore = '[![altText](imageLink)](URL)';
            myValueAfter = '';
            break;
        case 'hr':
            myValueBefore = '\n---\n';
            myValueAfter = '';
            break;
        case 'br':
            myValueBefore = '<br/>\n\n';
            myValueAfter = '';
            break;
    }
    if (document.selection) {
        myField.focus();
        document.selection.createRange().text = myValueBefore + document.selection.createRange().text + myValueAfter;
    } else if (myField.selectionStart || myField.selectionStart == '0') {
        let startPos = myField.selectionStart;
        let endPos = myField.selectionEnd;
        myField.value =
            myField.value.substring(0, startPos) + myValueBefore + myField.value.substring(startPos, endPos) + myValueAfter + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValueBefore.length;
        myField.selectionEnd = endPos + myValueBefore.length;

        myField.focus();
    }
    // Simulate Keypress (ENTER) to update markdown incase of LAG
    var keyEventPress = new KeyboardEvent('keyup', {
        code: 'Enter',
        key: 'Enter',
        charKode: 13,
        keyCode: 13,
        view: window,
    });
    myField.dispatchEvent(keyEventPress);
};

const slide = (e) => {
    let mark = document.getElementById('EDIT__textarea_left');
    let marktext = document.getElementById('getm');
    let viewer = document.getElementById('EDIT__textarea_right');
    switch (e) {
        case 'nill':
            viewer.style.width = '100%';
            marktext.style.padding = '0';
            mark.style.width = '0';
            break;
        case 'half':
            viewer.style.width = '50%';
            marktext.style.padding = '16px';
            marktext.style.width = '100%';
            mark.style.width = '50%';
            break;
        case 'full':
            viewer.style.width = '0';
            viewer.style.padding = '0';
            mark.style.width = '100%';
            marktext.style.padding = '16px';
            marktext.style.width = '100%';
            break;
    }
};

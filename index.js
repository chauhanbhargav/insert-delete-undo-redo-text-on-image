$(document).ready(function () {

    $("#draggable").draggable();

    /**
     * On change of File Upload.
     */
    $("#upload").on('change', function () {
        readURL(this);
    });

    /**
     * Read input and convert to base64 string 
     * @param {*} input 
     */
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#image').attr('src', e.target.result);
                $('.hide').show();
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    /**
     * array to store canvas objects history
     */
    canvas_history = [];
    s_history = true;
    cur_history_index = 0;
    DEBUG = true;
    var editor = $('#draggable');

    /**
     * store every modification of canvas in history array
     * @param {*} force 
     */
    function save_history(force) {
        //if we already used undo button and made modification - delete all forward history
        if (cur_history_index < canvas_history.length - 1) {
            canvas_history = canvas_history.slice(0, cur_history_index + 1);
            cur_history_index++;
        }
        var cur_canvas = JSON.stringify($(editor).html());

        //if current state identical to previous don't save identical states
        if (cur_canvas != canvas_history[cur_history_index] || force == 1) {
            canvas_history.push(cur_canvas);
            cur_history_index = canvas_history.length;
        }

        DEBUG && console.log('saved ' + canvas_history.length + " " + cur_history_index);
    }

    /**
     * Undo History
     */
    function history_undo() {
        if (cur_history_index > 0) {
            s_history = false;
            canv_data = JSON.parse(canvas_history[cur_history_index - 1]);
            $(editor).html(canv_data);
            cur_history_index--;
            DEBUG && console.log('undo ' + canvas_history.length + " " + cur_history_index);
        }
    }

    /**
     * Redo History
     */
    function history_redo() {
        if (canvas_history[cur_history_index + 1]) {
            s_history = false;
            canv_data = JSON.parse(canvas_history[cur_history_index + 1]);
            $(editor).html(canv_data);
            cur_history_index++;
            DEBUG && console.log('redo ' + canvas_history.length + " " + cur_history_index);
        }
    }
    $('#commented').on('change', function (e) {
        save_history();
    });
    $('#halighter, #deleted').on('click', function (e) {
        save_history();
    })
    $('#undo').on('click', function (e) {
        history_undo();
    });
    $('#redo').on('click', function (e) {
        history_redo();
    });
});

var input = document.querySelector("#commented");
var targetTextId;

/**
 * Handle Every Right Click
 * @param {*} action 
 * @param {*} event 
 */
function doAction(action, event) {
    console.log(event);

    switch (action) {
        case 'comment':
            input.style.display = "block";
            break;
        case 'delete':
            $('#' + targetTextId).css({
                "text-decoration": "line-through"
            });
            break;
        case 'halight':
            $('#' + targetTextId).css({
                "background-color": "yellow",
            });
            initDraw(document.getElementById('image'));
            break;
        default:
            break;
    }
}

/**
 * After Input value add data withing draggable div
 * @param {*} event 
 */
function changeToText(event) {
    var value = event.target.value;
    var id = Math.random().toString(36).substring(7);;
    $('#draggable').append('<div id=' + id + ' style="cursor:pointer" oncontextmenu="getValue(event)">' + value + '</div>');
    input.style.display = "none";
    event.target.value = "";
}

/**
 * Set id of right clicked html tag.
 * @param {*} event 
 */
function getValue(event) {
    targetTextId = event.srcElement.id;
}

function initDraw(canvas) {
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX + window.pageXOffset;
            mouse.y = ev.pageY + window.pageYOffset;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX + document.body.scrollLeft;
            mouse.y = ev.clientY + document.body.scrollTop;
        }
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;

    canvas.onmousemove = function (e) {
        setMousePosition(e);
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? Math.abs(mouse.x / 2) + 'px' : Math.abs(mouse.startX / 2) + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? Math.abs(mouse.y / 2) + 'px' : Math.abs(mouse.startY / 2)  + 'px';
        }
    }

    canvas.onclick = function (e) {
        console.log('mouse', mouse);
        if (element !== null) {
            element = null;
            canvas.style.cursor = "default";
            console.log("finsihed.");
        } else {
            console.log("Begin.");
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.className = 'rectangle'
            element.style.left = Math.abs(mouse.x / 2) + 'px';
            element.style.top = Math.abs(mouse.y / 2)  + 'px';
            canvas.before(element)
            canvas.style.cursor = "crosshair";
            element.style.backgroundColor = "transparent";
        }
    }

    $('.rectangle').onclick = function (e) {
        canvas.style.cursor = "default";
        console.log("finsihed.");
    }
}
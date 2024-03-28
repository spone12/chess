/**
 * Chess
 * Version 0.8.3
 */

var movePlayer = 0;
var gameOver = 0;
var grid = '';
var extensionImg = '.png';
var sideMoveWhite = true;
var stackChangeFigures = [];
var gameIsLocked = 0;
var moves = [];

var gridFigure = {

    'Black': {
        'pawnFirstMove': [],
        10: 'rook',
        11: 'horse',
        12: 'elephant',
        13: 'king',
        14: 'queen',
        15: 'elephant',
        16: 'horse',
        17: 'rook',
        20: 'pawn',
        21: 'pawn',
        22: 'pawn',
        23: 'pawn',
        24: 'pawn',
        25: 'pawn',
        26: 'pawn',
        27: 'pawn',
    },
    'White': {
        'pawnFirstMove': [],
        70: 'pawn',
        71: 'pawn',
        72: 'pawn',
        73: 'pawn',
        74: 'pawn',
        75: 'pawn',
        76: 'pawn',
        77: 'pawn',
        80: 'rook',
        81: 'horse',
        82: 'elephant',
        83: 'queen',
        84: 'king',
        85: 'elephant',
        86: 'horse',
        87: 'rook',
    }
};

/**
 * Document ready
 */
$(document).ready(function () {
    renderGrid();
    timer();

    // Reload the game
    $(".reload").click(function () {
        document.location.href = '';
    });

    // Figure movement
    $(document).on('click', '.highlighting', function (e) {

        let id = $(e.target).attr('id');
        if (id !== undefined) {
            moveFigure(id);
        }
    });

    $(".changeFigure").on('click', function () {
        changeFigure($(this).attr('id'))
    });
});


/**
 * Drawing a grid and figures
 */
function renderGrid() {
    // Horizontal cell names array
    let horizontalCellNames = Array.from({length: 9}, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
    horizontalCellNames.unshift('');

    // Vertical number cells array
    let verticalNumberCells = Array.from({length: 8}, (_, i) => i + 1);

    for (let i = 1; i <= 8; i++) {

        // Draw the horizontal cell names
        if (i == 1) {
            for (let j = 0; j < 9; j++) {
                grid += '<span class="horizontalCellNames">' + horizontalCellNames[j] + '</span>';
            }
        }

        grid += '<div class="line' + i + '">';
        for (let j = i * 10; j < (i * 10) + 8; j++) {

            // Draw a vertical cell numbers
            if (j == i * 10) {
                grid += '<span class="verticalNumberCells">' + verticalNumberCells.pop() + '</span>';
            }

            let figure = 'background.png';
            let side = '';

            $.each(gridFigure, function (key, value) {
                if (value[j] !== undefined) {
                    side = key;
                    figure = value[j] + side + extensionImg;
                }
            });

            let imgSrc = 'img/' + figure;
            let figureName = figure.split('.')[0];
            grid += '<span side="' + side + '" figure="' + figureName + '" id="line' + i + '__с' + j + '" line=' + i + ' cellNumber="' + j + '">' +
                "<img class='imgFigure' onclick='tracePath(this);' width=45 src='" + imgSrc + "' />"
                + '</span>';
        }
        grid += '</div>';
    }
    $('.field').html(grid);
    renderMesh();
    renderChangeFigure();
}

/**
 * Render a grid mesh
 */
function renderMesh() {
    for (let i = 1; i <= 8; i++) {
        for (let j = i * 10; j < (i * 10) + 8; j++) {
            // Render class background mesh
            let gridMesh = '';
            if (j % 2 != 0) {
                if (i % 2 != 0) {
                    gridMesh = 'gridMesh';
                }
            } else {
                if (i % 2 == 0) {
                    gridMesh = 'gridMesh';
                }
            }
            let id = 'line' + i + '__с' + j;
            $('#' + id).attr('class', gridMesh);
        }
    }
}

/**
 * Match timer
 */
function timer() {
    function prettyTimeString(num) {
        return (num < 10 ? "0" : "") + num;
    }

    var start = new Date;
    setInterval(function() {
        let total_seconds = (new Date - start) / 1000;

        let minutes = prettyTimeString(Math.floor(total_seconds / 60));
        total_seconds = total_seconds % 60;

        let seconds = prettyTimeString(Math.floor(total_seconds));
        let currentTime = minutes + ":" + seconds;

        $('.timer').text(currentTime);
    }, 1000);
}

/**
 * Figure movement
 * @param {int} id
 */
function moveFigure(id) {

    if (id === undefined) {
        return;
    }

    let isEaten = markEatenFigure(id);
    $('.highlightingActive').removeClass('highlightingActive');
    $('.highlighting').removeClass('highlighting');

    let filterActiveFigure = $('img[activeFigure=true]');
    let thisChessHtml = filterActiveFigure[0].outerHTML;
    let figure = filterActiveFigure.parent().attr('figure');
    let side   = filterActiveFigure.parent().attr('side');
    let currentMove = {
        'cellFrom'  : filterActiveFigure.parent().attr('id'),
        'objFrom'   : filterActiveFigure.parent()[0].outerHTML,
        'cellTo'    : id,
        'objTo'     : $('#' + id)[0].outerHTML,
        'isEaten'   : isEaten
    };

    filterActiveFigure.attr('src', 'img/background.png').parent().attr('figure', 'background');
    $('#' + id).html(thisChessHtml).attr('figure', figure).attr('side', side);
    filterActiveFigure.removeAttr('activeFigure');
    filterActiveFigure.parent().attr('side', '');

    // Pawn
    if (figure.includes('pawn')) {
        movePawnFigureCheck(filterActiveFigure, id, side);
    }

    // Assign a move to an opponent
    let sideMoveNext = (side === 'White') ? 'Black' : 'White';
    if (movePlayer == 0) {
        movePlayer = 1;
        $('.move').html(sideMoveNext + ' move');
    } else {
        movePlayer = 0;
        $('.move').html(sideMoveNext + ' move');
    };

    moves.push(currentMove);
    renderMesh();
}

/**
 * Roll back move
 * @param None
 */
function prevMove() {
    if (!moves.length) {
        return;
    }

    let prevMoveObj = moves.pop();
    let isEaten = prevMoveObj.isEaten;
    let side = (movePlayer == 0) ? 'Black' : 'White';
    $('#' + prevMoveObj.cellFrom)[0].outerHTML = prevMoveObj.objFrom;
    $('#' + prevMoveObj.cellTo)[0].outerHTML = prevMoveObj.objTo;

    // Change side move
    if (movePlayer == 0) {
        movePlayer = 1;
    } else {
        movePlayer = 0;
    };

    $('.move').html(side + ' move');
    if (isEaten) {
        $('.eatenFigures__' + (side == 'Black' ? 'White' : 'Black') + ' img:last').remove();
    }
    renderMesh();
}

/**
 * Check logic move pawn figure
 * @param {object} filterActiveFigure
 * @param {string} filterActiveFigure
 * @param {string} side
 */
function movePawnFigureCheck(filterActiveFigure, id, side) {

    let cell = filterActiveFigure.parent().attr('cellnumber');

    // Check the first move of a pawn on 2 squares
    if (!gridFigure[side]['pawnFirstMove'].includes(cell) && (gridFigure[side].hasOwnProperty(cell))) {
        gridFigure[side]['pawnFirstMove'].push(cell);
    }

    // Check enemy pawn reach the base
    let cellReached = $('#' + id).attr('cellnumber');
    checkEnemyBaseReached = Number(cellReached.toString().substr(0, 1));

    if (checkEnemyBaseReached == 1 || checkEnemyBaseReached == 8) {
        stackChangeFigures.push({
            cell: id,
            side: side,
            cellTo: -1,
            sideTo: -1,
        });
        $('.changeFigure' + side).show();
        gameIsLocked = 1;

        // Check figure replaced
        var checkChoisedFigure = setInterval(function () {
            var figureReplaced = $('.changeFigureWhite, .changeFigureBlack').is(':visible');
            if (!figureReplaced) {
                gameIsLocked = 0;
                clearInterval(checkChoisedFigure);
            }
        }, 500);
    }
}

/**
 * Mark the eaten figure
 * @param {int} id
 */
function markEatenFigure (id) {
    // Get link to image
    let srcFigure = $('#' + id).find("[src]").attr('src');
    if (!srcFigure.includes('background')) {

        let side = 'White';
        if (srcFigure.includes('Black')) {
            side = 'Black';
        }

        let htmlEatedFigure = '<img width="30" src="' + srcFigure + '">';
        $('.eatenFigures__' + side).append(htmlEatedFigure);
        return true;
    }
    return false;
}

/**
 * Drawing the line of the figure's course
 * @param {object} obj
 */
function tracePath (obj) {

    if (gameIsLocked) {
        return;
    }

    let object = $(obj).parent();
    if ($(object).hasClass('highlighting')) {
        moveFigure($(object).attr('id'));
        return;
    }

    let figure = object.attr('figure');
    if (figure === 'background') {
        return;
    }

    // Delete active highlighting
    if (object.hasClass('highlightingActive')) {
        $('.highlighting').removeClass('highlighting');
        $('.highlightingActive').removeClass('highlightingActive');
        renderMesh();
        return;
    }

    // Check move
     if (!checkMove(object)) {
         return;
     }

     if ($('span').hasClass('highlightingActive')) {
        renderMesh();
     }

     let cell = Number(object.attr('cellNumber'));

    // Delete active highlighting
    $('.highlighting').removeClass('highlighting');
    $('img[activeFigure=true]').removeAttr('activeFigure')

    // Set active figure
    $(obj).attr('activeFigure', true);

    $('.highlightingActive').removeClass('highlightingActive');
    $('span[cellNumber=' + cell + ']').attr('class', 'highlightingActive');

    switch (figure) {
        case 'pawnBlack':
        case 'pawnWhite':
            pawnMove(cell);
            break;
        case 'rookWhite':
        case 'rookBlack':
            rookMove(cell);
            break;
        case 'horseWhite':
        case 'horseBlack':
            horseMove(cell);
            break;
        case 'elephantWhite':
        case 'elephantBlack':
            elephantMove(cell);
            break;
        case 'queenWhite':
        case 'queenBlack':
            queenMove(cell);
            break;
        case 'kingWhite':
        case 'kingBlack':
            kingMove(cell);
            break;
    }
    сheckKingNoMove($(object).attr('side'));
}

/**
 * Draw a selection of shape changes
 */
function renderChangeFigure () {
    let changeFigure = ['queen', 'horse', 'rook', 'elephant'];
    $.each(changeFigure, function (key, value) {
        for (i = 1; i <= 2; i++) {
            let side = (i == 1) ? 'White' : 'Black';
            let imgSrc = 'img/' + value + side +  extensionImg;
            let grid = '<span class="changeFigure" figure="' + value + side + '" id="changeFigure_' + value + side + '">' +
                "<img width=45 src='" + imgSrc + "' />"
                + '</span>';
            $('.changeFigure' + side).append(grid);
        }
    });
}

/**
 * Change figure
 * @param {string} cell
 */
function changeFigure (cell) {
    if (stackChangeFigures.length > 0) {
        $.each(stackChangeFigures, function (k, item) {

            // If replace the pawn to another figure
            if ($(item)[0]['cellTo'] == -1) {
                let figureNeed = cell.split('_')[1];
                let cellNeed = $(item)[0]['cell'];
                $('#' + cellNeed).attr('figure', figureNeed);
                $('#' + cellNeed).children().attr('src', 'img/' + figureNeed + extensionImg);
                $('.changeFigureWhite, .changeFigureBlack').hide();
                stackChangeFigures.shift();
            }
        });
    }
}

/**
 * King move
 * @param {int} cell
 */
function kingMove(cell) {

    let side = $('span[cellNumber=' + cell + ']').attr('side');
    let sideNeed = (side === 'White') ? 'Black' : 'White';
    let arrayMoveKing = [11, 10, 9, 1, -1, -10, -9, -11];

    $.each(arrayMoveKing, function (key, value) {
        let calcCell =  cell - value;
        let filter = $('span[cellNumber=' + calcCell + ']');
        if (filter.attr('figure') === 'background' || filter.attr('side') === sideNeed) {
            filter.attr('class', 'highlighting');
        }
    });
}

/**
 * Queen move
 * @param cell
 */
function queenMove(cell) {
    elephantMove(cell);
    rookMove(cell);
}

/**
 * Elephant move
 * @param {int} cell
 */
function elephantMove(cell) {

    let side = $('span[cellNumber=' + cell + ']').attr('side');
    let sideNeed = (side === 'White') ? 'Black' : 'White';

    // Top right diagonal
    for (i = 1; i <= 7; i++) {
        let calcCell = cell - (i * 9);
        checkBorder = Number(calcCell.toString().substr(1, 1));

        if (checkBorder > 7) {
            break;
        }

        if (!renderDiagonalMove(calcCell, side, sideNeed)) {
            break;
        }
    }

    // Bottom left diagonal
    for (i = 1; i <= 7; i++) {
        let calcCell = cell - (i * -9);

        if (!renderDiagonalMove(calcCell, side, sideNeed)) {
            break;
        }

        checkBorder = Number(calcCell.toString().substr(1, 1));
        if (checkBorder == 0 || checkBorder > 7) {
            break;
        }
    }

    // Bottom right diagonal
    for (i = 1; i <= 7; i++) {
        let calcCell = cell - (i * -11);

        checkBorder = Number(calcCell.toString().substr(1, 1));
        if (checkBorder > 7) {
            break;
        }

        if (!renderDiagonalMove(calcCell, side, sideNeed)) {
            break;
        }
    }

    // Top left diagonal
    for (i = 1; i <= 7; i++) {
        let calcCell = cell - (i * 11);

        checkBorder = Number(calcCell.toString().substr(1, 1));
        if (checkBorder > 7) {
            break;
        }

        if (!renderDiagonalMove(calcCell, side, sideNeed)) {
            break;
        }
    }
}

/**
 * Render diagonal move
 * @param   {int} calcCell
 * @param   {string} side
 * @param   {string} sideNeed
 * @returns {boolean}
 */
function renderDiagonalMove (calcCell, side, sideNeed) {
    if (calcCell >= 10 && calcCell <= 90) {
        let filter = $('span[cellNumber=' + calcCell + ']');
        if (filter.attr('figure') === 'background' || filter.attr('side') === sideNeed) {
            filter.attr('class', 'highlighting');
        }
        if (
            filter.attr('side') === sideNeed ||
            (filter.attr('side') !== 'undefined' && filter.attr('side') === side)
        ) {
            return false;
        }
    }
    return true;
}

/**
 * Horse move
 * @param {int} cell
 */
function horseMove(cell) {

    let side = $('span[cellNumber=' + cell + ']').attr('side');
    let sideNeed = (side === 'White') ? 'Black' : 'White';
    let arrayMoveHorse = [-21, -19, -12, -8, 8, 12, 19, 21];

    $.each(arrayMoveHorse, function (key, value) {

        let calcCell =  cell - value;
        let filter = $('span[cellNumber=' + calcCell + ']');

        if (filter.attr('figure') === 'background' || filter.attr('side') === sideNeed) {
            filter.attr('class', 'highlighting');
        }
    });
}

/**
 * Pawn move
 * @param {int} cell
 */
function pawnMove(cell) {

    let side = $('span[cellNumber=' + cell + ']').attr('side');
    let sideNeed = (side === 'White') ? 'Black' : 'White';
    let cage = 10;

    // Double step in the first move of a pawn
    let isDoubleMove = false;
    if (!gridFigure[side]['pawnFirstMove'].includes(cell) && (gridFigure[side].hasOwnProperty(cell))) {
        cage = 20;
        isDoubleMove = true;
    }

    // Side Black
    if (side === 'Black') {
        toCell = Number(cell + cage);
        let i = cell;
        if (!isDoubleMove)
            i = toCell;

        for (i; i <= toCell; i += 10) {
            if (isDoubleMove && i == cell) {
                continue;
            }

            isStopDrawMove = oneCellPawnMovement(i, side, sideNeed, toCell, isDoubleMove);
            if (isStopDrawMove)
                break;
        }
    } else {
        toCell = Number(cell - cage);
        let i = cell;
        if (!isDoubleMove)
            i = toCell;

        for (i; i >= toCell; i -= 10) {
            if (isDoubleMove && i == cell) {
                continue;
            }

            isStopDrawMove = oneCellPawnMovement(i, side, sideNeed, toCell, isDoubleMove);
            if (isStopDrawMove)
                break;
        }
    }
}

/**
 * The logic of moving pawns one square away
 * @param   {int} i
 * @param   {string} side
 * @param   {string} sideNeed
 * @param   {int} toCell
 * @param   {boolean} isDoubleMove
 * @returns {boolean}
 */
function oneCellPawnMovement (i, side, sideNeed, toCell, isDoubleMove) {

    for (let j = i - 1; j <= i + 1; j++) {
        // In a double move, can't eat pieces on the right and left
        if (isDoubleMove && (j == Number(toCell - 1) || j == Number(toCell + 1))) {
            continue;
        }

        let filter = $('span[cellNumber=' + j + ']');

        // If the allied piece is in front, this move is double, then stop drawing
        if (isDoubleMove && filter.attr('side') == side && j == i) {
            return true;
        } else if (j !== i && filter.attr('figure') !== 'background' && filter.attr('side') === sideNeed) {
            filter.attr('class', 'highlighting');
        } else if (j === i && filter.attr('figure') === 'background' && filter.attr('side') !== sideNeed) {
            filter.attr('class', 'highlighting');
        } else if (isDoubleMove && filter.attr('side') === sideNeed) {
            // Stop the drawing move
            return true;
        }
    }
    return false;
}

/**
 * Rook move
 * @param {int} cell
 */
function rookMove(cell) {

    let filter = $('span[cellNumber=' + cell + ']');
    let side = filter.attr('side');
    let sideNeed = (side === 'White') ? 'Black' : 'White';
    let line = filter.attr('line');

    // Horizontal left movement
    for (i = cell; i >= Number(line + 0); i -= 1) {
        if (renderRockMovement(i, cell, side, sideNeed)) {
            break;
        }
    }

    // Horizontal right movement
    for (i = cell; i <= Number(line + 7); i += 1) {
        if (renderRockMovement(i, cell, side, sideNeed)) {
            break;
        }
    }

    // Vertical top movement
    for (i = cell; i >= 10; i -= 10) {
        if (renderRockMovement(i, cell, side, sideNeed)) {
            break;
        }
    }

    // Vertical bottom movement
    for (i = cell; i <= 90; i += 10) {
        if (renderRockMovement(i, cell, side, sideNeed)) {
            break;
        }
    }
}

/**
 * Render rock movement
 *
 * @param {int} i
 * @param {int} cell
 * @param {string} side
 * @param {string} sideNeed
 */
function renderRockMovement(i, cell, side, sideNeed) {
    let filter = $('span[cellNumber=' + i + ']');
    if (i !== cell) {
        let currentSide = filter.attr('side');
        if (currentSide === side)
            return true;

        if (currentSide !== 'background' && sideNeed === currentSide) {
            filter.attr('class', 'highlighting');
            return true;
        }
        filter.attr('class', 'highlighting');
    }
}

/**
 * Check player move
 * @param {object} obj
 * @returns {boolean}
 */
function checkMove(obj) {

    // Dont check move
    if ($('.checkDCM').is(':checked')) {
        return true;
    }

    if (movePlayer === 0 && obj.attr('side') === 'Black') {
        return false;
    } else if (movePlayer === 1 && obj.attr('side') === 'White') {
        return false;
    } else {
        return true;
    }
}

/**
 * Check king no movement
 * @param {string} currentSide
 */
function сheckKingNoMove(currentSide) {

    $('.highlighting[figure*=king]').each(function (key, obj) {

        let sideNeed = (currentSide === 'White') ? 'White' : 'Black';
        $(obj).removeClass('highlighting');
        let arrayMoveKing = [11, 10, 9, 1, -1, -10, -9, -11];
        let isCanMove = false;
        let cell = $(obj).attr('cellnumber');

        $.each(arrayMoveKing, function (keyMove, value) {
            let calcCell =  cell - value;
            let filter = $('span[cellNumber=' + calcCell + ']');
            if (!filter.hasClass('highlighting') && (filter.attr('figure') === 'background' || filter.attr('side') === sideNeed)) {
                isCanMove = true;
                return;
            }
        });

        if (!isCanMove) {
            alert(currentSide + ' win!');
            gameOver = 1;
        }
    });
}

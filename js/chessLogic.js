/**
 * Chess
 * Version 0.6
 */
var movePlayer = 0;
var gameOver = 0;
var grid = '';
var extensionImg = '.png';
var sideMoveWhite = true;
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
});

/**
 * Figure movement
 * @param {int} id
 */
function moveFigure(id) {

    if (id !== undefined) {

        $('.highlightingActive').removeClass('highlightingActive');
        $('.highlighting').removeClass('highlighting');
        let filterActiveFigure = $('img[activeFigure=true]');

        let thisChessHtml = filterActiveFigure[0].outerHTML;
        let figure = filterActiveFigure.parent().attr('figure');
        let side = filterActiveFigure.parent().attr('side');
        filterActiveFigure.attr('src', 'img/background.png').parent().attr('figure', 'background');
        $('#' + id).html(thisChessHtml).attr('figure', figure).attr('side', side);
        filterActiveFigure.removeAttr('activeFigure');
        filterActiveFigure.parent().attr('side', '');

        // Check the first move of a pawn on 2 squares
        if (figure.includes('pawn')) {

            let cell = filterActiveFigure.parent().attr('cellnumber');
            if (!gridFigure[side]['pawnFirstMove'].includes(cell) && (gridFigure[side].hasOwnProperty(cell))) {

                gridFigure[side]['pawnFirstMove'].push(cell);
            }
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

    }
}

/**
 * Drawing the line of the figure's course
 * @param {object} obj
 */
function tracePath (obj) {

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
        return;
    }

    // Check move
     if (!checkMove(object)) {
         return;
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
 * Drawing a grid and figures
 */
function renderGrid() {

    for ( let i = 1; i <= 8; i++) {

        grid += '<div class="line' + i + '">';
        for ( let j = i * 10; j < (i * 10) + 8; j++) {

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
                "<img onclick='tracePath(this);' width=45 src='" + imgSrc + "' />"
                + '</span>';
        }
        grid += '</div>';
    }

    $('.field').html(grid);
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
    let arrayMoveElephant = [-11, -9, 11, 9];
    let sideBlocked = [];

    for (i = 2; i <= 6; i++ ) {

        $.each(arrayMoveElephant, function (key, value) {

            let calcCell = cell + (i * value) - value;
            if (calcCell >= 10 && calcCell <= 90 && !sideBlocked.includes(key)) {

                    let filter = $('span[cellNumber=' + calcCell + ']');
                    if (filter.attr('figure') === 'background' || filter.attr('side') === sideNeed) {
                        filter.attr('class', 'highlighting');
                    }

                    // block the lines if collision
                    if (
                        filter.attr('side') === sideNeed ||
                        (filter.attr('side') !== 'undefined' && filter.attr('side') === side)
                    ) {

                        sideBlocked.push(key);
                    }
                }

        });
    }
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
            isStopDrawMove = logicOneCellMovement(i, side, sideNeed, toCell, isDoubleMove);
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
            isStopDrawMove = logicOneCellMovement(i, side, sideNeed, toCell, isDoubleMove);
            if (isStopDrawMove)
                break;
        }
    }
}

/**
 * The logic of moving pawns one square away
 * @param {int} i
 * @param {string} side
 * @param {string} sideNeed
 * @param {int} toCell
 * @param {boolean} isDoubleMove
 * @returns {boolean}
 */
function logicOneCellMovement (i, side, sideNeed, toCell, isDoubleMove) {

    for ( let j = i - 1; j <= i + 1; j++) {

        // In a double move, can't eat pieces on the right and left
        if (isDoubleMove && (j == Number(toCell - 1) || j == Number(toCell + 1))) {
            continue;
        }

        let filter = $('span[cellNumber=' + j + ']');

        // If the allied piece is in front, this move is double, then stop drawing
        if (isDoubleMove && filter.attr('side') == side && j == i) {
            return true;
        } else if( j !== i && filter.attr('figure') !== 'background' && filter.attr('side') === sideNeed) {
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

    horizontalLeftMovement(cell, side, sideNeed, line);
    horizontalRightMovement(cell, side, sideNeed, line);
    verticalTopMovement(cell, side, sideNeed);
    verticalBottomMovement(cell, side, sideNeed);
}

/**
 * Horizontal left move
 * @param {int} cell
 * @param {string} side
 * @param {string} sideNeed
 * @param {int} line
 */
function horizontalLeftMovement (cell, side, sideNeed, line) {

    // Left
    for (i = cell; i >= Number(line + 0); i -= 1) {

        let filter = $('span[cellNumber=' + i + ']');
        if (i !== cell) {

            let currentSide = filter.attr('side');
            if (currentSide === side)
                break;

            if (currentSide !== 'background' && sideNeed === currentSide) {

                filter.attr('class', 'highlighting');
                break;
            }
            filter.attr('class', 'highlighting');
        }
    }
}

/**
 * Horizontal right move
 * @param {int} cell
 * @param {string} side
 * @param {string} sideNeed
 * @param {int} line
 */
function horizontalRightMovement (cell, side, sideNeed, line) {

    // Right
    for (i = cell; i <= Number(line + 7); i += 1) {

        let filter = $('span[cellNumber=' + i + ']');
        if (i !== cell) {

            let currentSide = filter.attr('side');
            if (currentSide === side)
                break;

            if (currentSide !== 'background' && sideNeed === currentSide) {

                filter.attr('class', 'highlighting');
                break;
            }
            filter.attr('class', 'highlighting');
        }
    }
}

/**
 * Vertical top move
 * @param {int} cell
 * @param {string} side
 * @param {string} sideNeed
 */
function verticalTopMovement (cell, side, sideNeed) {

    // Top
    for (i = cell; i >= 10; i -= 10) {

        let filter = $('span[cellNumber=' + i + ']');
        if (i !== cell) {

            let currentSide = filter.attr('side');
            if (currentSide === side)
                break;

            if (currentSide !== 'background' && sideNeed === currentSide) {

                filter.attr('class', 'highlighting');
                break;
            }
            filter.attr('class', 'highlighting');
        }
    }
}

/**
 * Vertical bottom move
 * @param {int} cell
 * @param {string} side
 * @param {string} sideNeed
 */
function verticalBottomMovement (cell, side, sideNeed) {

    // Bottom
    for (i = cell; i <= 90; i += 10) {

        let filter = $('span[cellNumber=' + i + ']');
        if (i !== cell) {
            let currentSide = filter.attr('side');
            if (currentSide === side)
                break;

            if (currentSide !== 'background' && sideNeed === currentSide) {
                filter.attr('class', 'highlighting');
                break;
            }
            filter.attr('class', 'highlighting');
        }
    }
}

/**
 * Check player move
 * @param {object} obj
 * @returns {boolean}
 */
function checkMove(obj) {

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

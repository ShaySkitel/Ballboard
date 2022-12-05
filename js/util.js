'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function createMat(rows, cols) {
    const mat = []
    for (var i = 0; i < rows; i++) {
        const row = []
        for (var j = 0; j < cols; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getNeighborsInMat(mat, pos) {
    const negs = []
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if(!mat[i]) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if(i === pos.i && j === pos.j) continue
            if(!mat[i][j]) continue
            negs.push(mat[i][j])
        }
    }
    return negs
}
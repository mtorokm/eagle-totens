var mysql = require("mysql2");
var sql = require('mssql');

// CONEXÃO DO SQL SERVER - AZURE (NUVEM)
var sqlServerConfig = {
    user: "adminEagleTotens2022",
    password: "2ads$grupo9",
    database: "eagle_totens",
    server: "eagle-totens.database.windows.net",
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
    }
}

// CONEXÃO DO MYSQL WORKBENCH (LOCAL)
var mySqlConfig = {
    host: "localhost",
    user: "root",
    database: "eagle_totens",
    password: "t69967482190",
};

function executar(instrucao) {
    // VERIFICA A VARIÁVEL DE AMBIENTE SETADA EM app.js
    if (process.env.AMBIENTE_PROCESSO == "producao") {
        return new Promise(function(resolve, reject) {
            sql.connect(sqlServerConfig).then(function() {
                return sql.query(instrucao);
            }).then(function(resultados) {
                console.log(resultados);

                if (resultados.rowsAffected == 1) {
                    resolve(resultados.recordset);
                }
                if (resultados.recordsets[0].length == 0) {
                    console.log("O select não retornou valor nenhum! :(");
                    resolve("busca retornou resultado vazio");
                } else {
                    resolve(resultados.recordset);
                }
            }).catch(function(erro) {
                reject(erro);
                console.log('ERRO: ', erro);
            });
            sql.on('error', function(erro) {
                return ("ERRO NO SQL SERVER (Azure): ", erro);
            });
        });
    } else if (process.env.AMBIENTE_PROCESSO == "desenvolvimento") {
        return new Promise(function(resolve, reject) {
            var conexao = mysql.createConnection(mySqlConfig);
            conexao.connect();
            conexao.query(instrucao, function(erro, resultados) {
                conexao.end();
                if (erro) {
                    reject(erro);
                }
                console.log(resultados);
                resolve(resultados);
            });
            conexao.on('error', function(erro) {
                return ("ERRO NO MySQL WORKBENCH (Local): ", erro.sqlMessage);
            });
        });
    } else {
        return new Promise(function(resolve, reject) {
            console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM app.js\n");
            reject("AMBIENTE NÃO CONFIGURADO EM app.js")
        });
    }
}

module.exports = {
    executar
}
import sqlite3  from "sqlite3";
import {nanoid} from "nanoid";
import { input, select } from "@inquirer/prompts";
import Table from "cli-table";
import { Display } from "../public/display.js";

export class Livro_propor{
    constructor(){
        this.path = "./src/private/db/livropropor.db";
        this.conn = new sqlite3.Database(this.path);
        this.id =  `${nanoid(6)}-${nanoid(5)}`;
        this.data = new Date().toLocaleDateString("pt-BR");
    }

    async adicionarsugestao(user, titulo, autor){
        if(titulo){
            try {
                const livro_existe = await new Promise((resolve, reject) => {
                    this.conn.get(`
                        SELECT * FROM sugerir WHERE titulo_livro = ?
                    `, [titulo], (err, row) => {
                        if(err){
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });

                if(livro_existe && livro_existe.titulo_livro === titulo){
                    return false;
                } else {
                    await new Promise((resolve, reject) => {
                        this.conn.run(`
                            INSERT INTO sugerir (user_id, user_login, 
                            id_livro, titulo_livro, autor_livro, data) VALUES
                            (?,?,?,?,?,?)
                        `, [user.user_id, user.user_login, this.id, titulo, autor, this.data], (err) => {
                            if(err){
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
                return true;
            } catch(err) {
                console.log(err);
                return false;
            } finally {
                this.conn.close();
            }
        }
    }
    /* 
    createTable(){
        this.conn.run(`
            CREATE TABLE IF NOT EXISTS sugerir (
                user_id TEXT,
                user_login TEXT,
                id_livro TEXT,
                titulo_livro TEXT,
                autor_livro TEXT,
                data TEXT
            )
        `)
    }
    */
}
// const prop = new Livro_propor();

class Book {
    constructor(titulo, autor){
        this.id = `${nanoid(10)}`;
        this.titulo = titulo;
        this.autor = autor;
        this.livre = "true";
        this.adiconadoDia = new Date().toLocaleDateString();
    }
}

export class SystemADM{
    constructor(){
        this.display = new Display();
        this.path = "./src/private/db/livros.db";
        this.conn = new sqlite3.Database(this.path);
        this.table = new Table({
            head:["ID", "livro", "autor", "livre"],
            colWidths: [12, 22, 22, 10]
        });
    }

    $_iniciar(user){
        this.$_menu_1(user);
    }

    async $_iniciar(user){
        console.clear();
        console.log(`user: ${user.user_login} | ${user.user_id}`);
        const opcao = await select({
            message:":D",
            choices: [
                {name:"adicionar livro", value:"1"},
                {name:"deletar livro", value:"2"},
                {name:"ver livros", value:"3"},
                {name:"sair", value:"4"},
            ]
        })

        switch(opcao){
            case "1":
                const titulo = await input({message:"titulo: "});
                const autor = await input({message:"autor: "});
                const ok = await this.adicionarlivro(new Book(titulo, autor));
                if(ok) {
                    console.log("Livro adicionado.");
                    setTimeout(()=> {
                        this.$_iniciar(user);
                    },1200);
                }
                break;
            case "2":
                console.clear();
                const id = await input({message:"id:"});
                const deletado = await this.deletarLivro(id);
                if(deletado){
                    console.log("Livro deletado.");
                } else {
                    console.log("Algo de errado não está certo.");
                }
                this.$_iniciar(user);
                break;
            case "3":
                const isOK = await this.mostrarlivros();
                console.log("");
                if(isOK){
                    console.log(this.table.toString());
                    const op = await select({
                    message: "Escolha uma opção:",
                    choices: [
                        {name:"voltar", value:"1"},
                    ]
                })
                if(op === "1") {
                    this.$_iniciar(user);
                }
                }
            break;
            case "4":
                this.conn.close();
                this.display.$_menu_1();
                break;
        }
    }
    async deletarLivro(id){
        try{
            await new Promise((resolve, reject) => {
                this.conn.run(`DELETE FROM livros WHERE livro_id = ?`, [id], (err)=>{
                    if(err){
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        }catch(err){
            console.log("Erro ao tentar deletar o livro");
            return false;
        }
           
    } 
    async mostrarlivros() {
        try {
            const books = await new Promise((resolve, reject) => {
                this.conn.all(`SELECT * FROM livros`, [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            books.forEach(el => {
                this.table.push([el.livro_id, el.livro_titulo, el.livro_autor, el.livro_livre]);
            });
            return true;
        } catch (err) {
            return err;
        }
    }
    async verificalivor(id){
        if(id){
            const livre = new Promise((resolve, reject) => {
                this.conn.get(`
                    SELECT * FROM livros WHERE livro_id = ?`, [id], (err, row)=> {
                        if(err){
                            reject(err);
                        } else {
                            if(row.livro_id !== "false"){
                                resolve(true);
                            } else {
                                return false;
                            }
                        }
                    });
            });
            return livre;
        }
        return false;
    }

    async adicionarlivro(book){
        const {id, titulo, autor, livre, adiconadoDia} = book;

        if(titulo){
            try {
                const livro_existe = new Promise((resolve, reject) => {
                    this.conn.get(`
                        SELECT * FROM livros WHERE livro_titulo = ?
                    `, [titulo], (err, row) => {
                        if(err){
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });

                if(livro_existe && livro_existe.livro_titulo === titulo){
                    return false;
                } else {
                    new Promise((resolve, reject) => {
                        this.conn.run(`
                        INSERT INTO livros (livro_id, livro_titulo, livro_autor,
                        livro_livre, data) VALUES
                        (?,?,?,?,?)`, [id, titulo, autor, livre, adiconadoDia], (err)=>{
                            if(err){
                                reject(err);
                            } else {
                                resolve();
                                
                            }
                        });
                    });
                } 
                return true;
            } catch(err) {
                console.log(err);
                return false;
            }
        }
    }
/* 
    createTable(){
        this.conn.run(`
            CREATE TABLE IF NOT EXISTS livros (
                livro_id TEXT,
                livro_titulo TEXT,
                livro_autor TEXT,
                livro_livre TEXT,
                data TEXT
            )
        `)
    }
*/ 
}
//const adm = new SystemADM();
// adm.mostrarlivros();
// adm.createTable();
// adm.adicionarlivro(new Book("Código Limpo", "Robert Cecil Martin"));

export class Alugar{
    constructor(){
        this.path ="./src/private/db/alugar.db";
        this.conn = new sqlite3.Database(this.path);
        this.data = new Date().toLocaleDateString("pt-BR");
    }

    async alugar_livro(id_user, id_book){
        const conectar = new SystemADM();
        const conn_a = new sqlite3.Database(conectar.path);

        const isFree = await conectar.verificalivor(id_book);
        if(isFree){
            try{
                await new Promise((resolve, reject) => {
                    conn_a.run(`
                    UPDATE livros SET livro_livre = ? WHERE livro_id = ?
                    `, ["false", id_book], (err) => {
                        if(err){
                            reject(err);
                        } else {
                            resolve()
                        }
                    });
                })

                await new Promise((resolve, reject) => {
                    this.conn.run(`INSERT INTO livros (livro_id, user_id, data) 
                    VALUES (?,?,?)`, [id_book, id_user, this.data], (err) => {
                        if(err){
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                })
                conn_a.close();
                return true;
            } catch(err){
                console.log("erro ao tentar atualizar livro.");
                return false;
            }
        }
    }
    async devolver_livro(id_book){
        const conectar = new SystemADM();
        const conn_a = new sqlite3.Database(conectar.path);
        try{
            await new Promise((resolve, reject) => {
                conn_a.run(`
                UPDATE livros SET livro_livre = ? WHERE livro_id = ?
                `, ["true", id_book], (err) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve()
                    }
                });
            })

            await new Promise((resolve, reject) => {
                this.conn.run(`DELETE FROM livros WHERE livro_id = ?`, [id_book], (err) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
            return true;
        } catch(err){
            console.log("erro ao tentar atualizar livro.");
            return false;
        }
    }

    async userLivros(user, table){
        if(user){
            try {
                const books = await new Promise((resolve, reject) => {
                    this.conn.all(`SELECT * FROM livros WHERE user_id = ?`, [user], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });
                books.forEach(el => {
                    table.push([el.livro_id, el.user_id]);
                });
                return true;
            } catch (err) {
                return err;
            }
        }
    }
    /* 
    createTable(){
        this.conn.run(`
            CREATE TABLE IF NOT EXISTS livros (
                livro_id TEXT,
                user_id TEXT,
                data TEXT
            )
        `)
    }
    */
}
// const alugar = new Alugar();

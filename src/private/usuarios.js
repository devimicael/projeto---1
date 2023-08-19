import sqlite3  from "sqlite3";
import {nanoid} from "nanoid";

export class DB_users{
    constructor(){
        this.path = "./src/private/db/usuarios.db";
        this.conn = new sqlite3.Database(this.path);
    }

    autenticaruser(user, pass){
        function compararSenhas(pass, dbpass){
            if(pass === dbpass) return true;
            return false;
        }
        return new Promise((resolve, reject) => {
            this.conn.get(`
                SELECT * FROM usuario WHERE user_login = ?
            `, [user], (err, row) => {
                if(err){
                    reject(err);
                } else {
                    if(row && compararSenhas(pass, row.user_pass)){
                        resolve(row);
                    } else {
                        reject(new Error("credenciais inválidas."));
                    }
                }
            });

        });
    }

    createTable(){
        this.conn.run(`
            CREATE TABLE IF NOT EXISTS usuario (
                id INTEGER PRIMAY KEY,
                user_id TEXT,
                user_login TEXT,
                user_pass TEXT,
                user_role TEXT,
                user_data TEXT
            )
        `)
    }
    async adicionarNovoUsuario(user) {
        const { id, nomelogin, senha, role, datacriacao } = user;
        
        if (nomelogin) {
            try {
                const existe_user = await new Promise((resolve, reject) => {
                    this.conn.get(`
                        SELECT * FROM usuario WHERE user_login = ?
                    `, [nomelogin], (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
    
                if (existe_user && existe_user.user_login === nomelogin) {
                    return false;
                } else {
                    await new Promise((resolve, reject) => {
                        this.conn.run(`
                            INSERT INTO usuario (user_id, user_login, user_pass, user_role, user_data)
                            VALUES (?, ?, ?, ?, ?)
                        `, [id, nomelogin, senha, role, datacriacao], (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                    
                    return true; 
                }
            } catch (err) {
                console.error(err); 
                return false; 
            } finally {
                this.conn.close(); 
            }
        }
    }
}
export class CreateUser{
    constructor(nomelogin, senha){
        this.id = `${nanoid(4)}-${nanoid(2)}`;
        this.nomelogin = nomelogin;
        this.senha = senha;
        this.role = "user";
        this.datacriacao = new Date().toLocaleDateString("pt-BR");
    }
}
// const db = new DB_users()

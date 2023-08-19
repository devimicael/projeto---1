import { select, input, password } from "@inquirer/prompts";
import { CreateUser, DB_users } from "../private/usuarios.js";
import { Menuser } from "../private/display_user.js";
import { SystemADM } from "../private/adm.js";

export class Display{
    iniciar(){
        console.log(
         "rodando"
        )
        this.$_menu_1();
    }

    async $_menu_1(){
        console.clear();
        const opcao = await select({
            message:"MENU: principal",
            choices: [
                {name:"logar", value:"1"},
                {name:"cadastrar", value:"2"},
                {name:"sair", value:"3"},
            ]
        });

        switch(opcao){
            case "1":
                this.login();
                break;
            case "2":
                this.cadastro();
                break;
            case "3":
                break;
        }
    }

    async login(){
        console.clear();
        const db = new DB_users();
        console.log("MENU: principal > login");

        const nameuser = await input({message:"usuário:"});
        const passuser = await password({message:"senha:"});

        try{
            const ok = await db.autenticaruser(nameuser, passuser);
            if(ok.user_role === 'user'){
                const menu_user = new Menuser();
                menu_user.iniciar(ok);
            } else {
                const menu2 = new SystemADM();
                menu2.$_iniciar(ok);
            }

        } catch(err){
            console.log("algo que não deveria está acontecendo está acontecendo. D:")
        }
    }

    async cadastro(){
        console.clear();
        const db = new DB_users();
        console.log("MENU: principal > cadastro");
        const nameuser = await input({message:"nome de usuário:"});
        const passuser = await password({message:"senha:"});

        try{
            const ok = await db.adicionarNovoUsuario(new CreateUser(nameuser, passuser));
            console.log(ok);
            if(ok){
                console.log("usuário cadastrado com sucesso. :D");
                setTimeout(() => {
                    this.$_menu_1();
                }, 1000)
            } else {
                console.log("algo de errado aconteceu com seu cadastro. tente novamente!");
                setTimeout(() => {
                    this.cadastro();
                }, 1000)
            }
        } catch(err){
            console.log("algo que não deveria está acontecendo está acontecendo. D:")
        }
    }
}
import Table from "cli-table";
import { Display } from "../public/display.js";
import { Alugar, Livro_propor, SystemADM } from "./adm.js";
import { select, input } from "@inquirer/prompts";

export class Menuser{
    constructor(){
        this.config = new Alugar();
        this.tableuser = new Table({
            head:["livro iID", "user ID"],
            colWidths: [12, 12]
        });
    }

    iniciar(user){
        this.$_menu_1(user);
    }

    async $_menu_1(user){
        console.clear();
        const display = new Display();
        console.log(`user: ${user.user_login} | id: ${user.user_id}`);
        const opcao = await select({
            message:"MENU: usuário",
            choices: [
                {name:"alugar", value:"1"},
                {name:"devolver", value:"2"},
                {name:"ver livros", value:"3"},
                {name:"meus livros", value:"4"},
                {name:"cadastrar livro", value:"5", description:'sugerir um livro?'},
                {name:"sair", value:"6"},
            ]
        });
        switch(opcao){
            case "1":
                const id_Li = await input({message:"id livro:"});
                const isAlugado = await this.config.alugar_livro(user.user_id, id_Li);
                if(isAlugado){
                    console.log("Livro alugado com sucesso.");
                } else {
                    console.log("deu pau");
                }
                this.$_menu_1(user);
                break;
            case "2":
                const id_Li2 = await input({message:"id livro:"});
                const isAlugado2 = await this.config.devolver_livro(id_Li2);
                if(isAlugado2){
                    console.log("Livro devolvido com sucesso.");
                } else {
                    console.log("deu pau");
                }
                this.$_menu_1(user);
                break;
            case "3":
                const mostrar = new SystemADM();
                const isOK = await mostrar.mostrarlivros();
                console.log("");
                if(isOK){
                    console.log(mostrar.table.toString());
                    const op = await select({
                    message: "Escolha uma opção:",
                    choices: [
                        {name:"voltar", value:"1"},
                    ]
                });
                if(op === "1") {
                    this.$_menu_1(user);
                }
                }
                break;
            case "4":
                const talbeok = await this.config.userLivros(user.user_id, this.tableuser);
                if(talbeok){
                    console.log("");
                    console.log(this.tableuser.toString());
                    const op = await select({
                        message: "Escolha uma opção:",
                        choices: [
                            {name:"voltar", value:"1"},
                        ]
                    });
                    if(op === "1") {
                        this.$_menu_1(user);
                    }
                }
                break;
            case "5":
                this.sugerirLivro(user);
                break;
            case "6":
                console.log('Saindo...');
                setTimeout(() => {
                    display.iniciar();
                },2000);
                break;
        }
    }
    
    async sugerirLivro(user){
        console.clear();
        const sugerir = new Livro_propor();
        console.log("MENU: usuário > cadastrar livro");
        const titulo = await input({message:"titulo:"});
        const autor = await input({message:"autor:"});
        const ok = await sugerir.adicionarsugestao(user, titulo, autor);
        if(ok){
            console.log("livro cadastrado com sucesso.");
            setTimeout(() => {
                this.iniciar(user);
            },1200);
        } else  {
            console.log("algo deu error. tente novamente!");
            setTimeout(() => {
                this.sugerirLivro();
            },1200);
        }
    }
}
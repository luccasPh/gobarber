<div align="center" style="margin-bottom: 20px;">
<img alt="gobarber" src="https://user-images.githubusercontent.com/32133062/113152424-809d7e00-920c-11eb-97d7-8bb9ad16446e.png" width="auto" heigth="auto"/>
</div>

<div align="center" style="margin: 20px;">
  
<p align="center">
<a href="https://rocketseat.com.br">
  <img alt="Made by Rocketseat" src="https://img.shields.io/badge/made%20by-Rocketseat-%237519C1">
</a>
 <a>
<img alt="License" src="https://img.shields.io/github/license/vitorserrano/ecoleta?color=%237519C1">
<br><br>


<p align="center" >
  <a href="#fire-prévia-da-aplicação"> :fire: Prévia da Aplicação</a> |
  <a href="#rocket-tecnologias-usadas"> :rocket: Tecnologias Usadas</a> |
  <a href="#hammer-deploy-da-aplicação"> :hammer: Deploy da Aplicação</a> |
  <a href="#zap-executando-o-projeto"> :zap: Executando o Projeto </a> 
</p>

</div>

## :barber: O projeto

Aplicação para agendar e gerenciar serviços de beleza, onde prestadores de serviços podem se cadastrar,
e usuários poderão marcar agendamentos com estes provedores.

## :fire: Prévia da Aplicação

<div align="center"> 
<img src="https://media.giphy.com/media/Lm6bmg75wR7Llcf9JG/giphy.gif" alt="preview"/>
</div>

### :rocket: Tecnologias Usadas

O projeto foi feito com as seguintes tecnologias:

- [Python](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Cloudinary](https://cloudinary.com/)
- [Docker](https://www.docker.com/)
- [JWT](https://jwt.io/)
- [ReactJS](https://pt-br.reactjs.org/)
- [ExpressJS](https://expressjs.com/)
{...}

## :hammer: Deploy da Aplicação
- [Web](https://lucas-gobarber.vercel.app/)
- [Mobile](https://expo.io/@luccasph/projects/gobarber)

## :zap: Executando o Projeto
#### Clonando o projeto
```sh
$ git clone https://github.com/luccasPh/gobarber.git
$ cd gobarber
```
#### Iniciando o Backend e Frontend
```sh
# Criando a imagem Docker do banco de dados:
# Dentro do projeto, já existe uma arquivo docker-compose.yml que possui o
# PostgreSQL como banco de dados, basta ter o Docker instalado em sua máquina.
$ docker-compose up -d # Iniciará em background e não irá bloquear o shell
```
- [API Documentation](http://localhost:8000/docs)
- [React app](http://localhost:3000)

#### Iniciando o Mobile

```
#### Iniciando o Mobile(Android)
```sh
$ cd mobile
$ yarn && yarn android && yarn start
```

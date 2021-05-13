# posts-feed-api


API para um feed de posts públicos criado com NodeJs, Express e MongoDB.
  - Autenticação feita com JWT usando Bearer Token e Middleware
  - CRUD de usuários respeitando a autenticação de cada um
  - CRUD de posts, respeitando a autenticação de cada usuário
  - Like de posts para usuário cadastrado e logado
  - Filtro de Posts por favoritos, meus posts, todos os posts
  - Image upload handler nos updates de Usuário, criação de post e update de post

#### Você pode conferir a [documentação da API](https://documenter.getpostman.com/view/15618055/TzRVekiL).

#### Você pode ver uma live version da API implementada em um feed criado com React: [Live version](https://post-feed-network.herokuapp.com/)

Design inicial dos models noSQL:  <br/>
<img src="https://i.ibb.co/RyDqFBz/Captura-de-tela-2021-05-13-195258.png" width="500" title="hover text">

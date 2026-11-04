# Retorno dos e-mails de autenticação

O app envia confirmação de cadastro para `https://whislyapp.com/auth/callback` e recuperação de senha para `https://whislyapp.com/reset-password`, mesmo quando o cadastro começa no servidor local. `127.0.0.1` e `localhost` não funcionam em um celular que abre o e-mail fora do computador.

No projeto Supabase usado pelo Whisly (`uvkdhuqndzrxqrkmevtr`), a configuração foi conferida em **Authentication → URL Configuration** em 04/11/2026:

- **Site URL:** `https://whislyapp.com`
- **Redirect URLs:** a regra `https://whislyapp.com/**` permite `/auth/callback` e `/reset-password`

O modelo atual de confirmação usa `{{ .ConfirmationURL }}` no botão. Assim, o destino do link vem da requisição de cadastro. O cadastro mais recente, criado às 10:38, aparece como confirmado e com primeiro acesso às 10:39. Esse horário coincide com o relato da falha no navegador do celular e indica que a confirmação pode ter ocorrido antes da tentativa de abrir o endereço local.

Depois de publicar o app, testar um novo cadastro abrindo o e-mail no celular. O resultado esperado é a tela de confirmação no domínio público, seguida de acesso à conta. O envio do e-mail, por si só, não valida o retorno.

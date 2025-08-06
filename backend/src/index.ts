import express, { type Request, type Response } from 'express';

// Criando o aplicativo
const app = express();

// Definindo a porta
const PORT = 3000;

// Criando uma rota de teste

app.get('/', (req: Request, res: Response) => {
  res.send('backend está funcionando!');
});

// Ligando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso no endereço http://localhost:${PORT}`);
});
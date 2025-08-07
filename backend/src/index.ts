// [Pra você]: Este é um código especial para depuração.

import express, { type Request, type Response } from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';
import fs from 'fs'; // Importando o módulo para salvar arquivos

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

// ... (Interface Product não muda)
interface Product {
    title: string;
    rating: string | null;
    reviews: string | null;
    imageUrl: string | null;
}

app.get('/api/scrape', async (req: Request, res: Response) => {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ error: 'A palavra-chave é obrigatória.' });
    }

    let browser;
    let page; // [Pra você]: Declarando a page aqui para podermos usá-la no catch.
    try {
        console.log('Iniciando o navegador Puppeteer em modo Stealth...');
        browser = await puppeteer.launch({ headless: "new" });

        page = await browser.newPage();
        const amazonUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}`;

        console.log(`Navegando para: ${amazonUrl}`);
        await page.goto(amazonUrl, { waitUntil: 'domcontentloaded' });

        const containerSelector = 'div[data-component-type="s-search-result"][data-asin]';
        console.log(`Esperando pelos produtos com o seletor: ${containerSelector}`);
        await page.waitForSelector(containerSelector, { timeout: 15000 });

        // [Pra você]: Se o código chegasse aqui, ele funcionaria. Mas ele vai dar timeout.
        const html = await page.content();
        await browser.close();
        // ... (o resto do código de parsing)

    } catch (error) {
        console.error('Um erro de timeout ocorreu, como esperado. Iniciando depuração...');

        // --- INÍCIO DO CÓDIGO DE DEPURAÇÃO ---
        if (page) {
            console.log('Tirando screenshot da página atual...');
            // Tira uma foto da página inteira e salva como 'debug_screenshot.png'
            await page.screenshot({ path: 'debug_screenshot.png', fullPage: true });

            console.log('Salvando o HTML da página atual...');
            // Pega o HTML da página e salva como 'debug_page.html'
            const htmlContent = await page.content();
            fs.writeFileSync('debug_page.html', htmlContent);

            console.log("Arquivos de depuração 'debug_screenshot.png' e 'debug_page.html' foram criados na pasta 'backend'.");
        }
        // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

        if (browser) await browser.close(); 

        res.status(500).json({
            error: 'Timeout: A Amazon provavelmente nos serviu uma página de verificação (CAPTCHA). Verifique os arquivos de depuração.',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso no endereço http://localhost:${PORT}`);
});
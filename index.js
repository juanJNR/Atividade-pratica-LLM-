import "dotenv/config";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-oss-120b:free";

if (!API_KEY) {
    console.error("Erro: crie o arquivo .env com OPENROUTER_API_KEY.");
    process.exit(1);
}

async function chamarLLM(palavraIngles) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-OpenRouter-Title": "Atividade FIA ADS"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: `Você é um dicionário inteligente ingles para portugues.
Quando o usuário enviar uma palavra em ingles, responda apenas com um json válido, sem texto fora do JSON, sem markdown, sem explicações.
O JSON deve seguir exatamente este formato:
{
  "palavra_ingles": "palavra em inglês",
  "classe_gramatical": "substantivo | verbo | adjetivo | etc",
  "som_aproximado": "como pronunciar em português aproximado, ex: 'apset' para upset",
  "frases": [
    {
      "contexto": "descrição curta do contexto",
      "frase_ingles": "frase em inglês com a **palavra** em negrito",
      "frase_portugues": "tradução da frase em português"
    },
    {
      "contexto": "descrição curta do contexto",
      "frase_ingles": "frase em inglês com a **palavra** em negrito",
      "frase_portugues": "tradução da frase em português"
    }
  ],
  "familia": {
    "substantivo": "palavra ou null",
    "verbo": "palavra ou null",
    "adjetivo": "palavra ou null"
  },
  "false_friend": "explicação se houver armadilha, ou null",
  "quiz": {
    "pergunta": "frase com ___ no lugar da palavra",
    "opcoes": ["opção 1", "opção 2", "opção 3", "opção 4"],
    "resposta_correta": 0
  }
}
Nunca invente traduções. Nunca saia do formato JSON.`

                },
                {
                    role: "user",
                    content: palavraIngles
                }
            ],
            temperature: 0.3,
            max_completion_tokens: 700
        })
    });

    if (!response.ok) {
        const detalhe = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${detalhe}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error("A API respondeu, mas nao retornou texto.");
    }

    console.log("\nResposta da IA:\n");
    console.log(text);
}

const rl = readline.createInterface({ input: stdin, output: stdout });
const palavraIngles = await rl.question("Digite a palavra em ingles: ");
rl.close();

chamarLLM(palavraIngles).catch((error) => {
    console.error("Falha ao chamar o OpenRouter:");
    console.error(error.message);
});
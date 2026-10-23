# Revisão independente do conjunto de referência via GLM-5.3

Esta bancada é isolada numa branch de experimento. Ela **não altera o motor, os JSON de referência nem a PR S2.1**. O programa envia ao gateway Digiti o prompt de revisão e os dois lotes Markdown existentes, sem reescrever seu conteúdo.

## Contrato de chamada conhecido

O caminho utilizado anteriormente no ambiente Hubstry foi:

- Endpoint OpenAI-compatible: `https://ldgllm.digiti.net.br/v1/chat/completions`
- Autenticação: `Authorization: Bearer $MAAS_API_KEY`
- Corpo: `model`, `messages`, `stream: false`, `temperature: 0`

Esse contrato foi comprovado anteriormente com o identificador `glm-5.2`, não com `glm-5.3`. A documentação atual da Huawei MaaS lista `glm-5.3` como Model ID, com pensamento profundo obrigatório e function calling: [lista oficial de modelos](https://support.huaweicloud.com/intl/en-us/model-list-maas/model_list_0001.html) e [parâmetros da API OpenAI-compatible](https://support.huaweicloud.com/intl/en-us/model-call-maas/model-call-021.html). Isso **não comprova** que o gateway Digiti já roteie esse novo Model ID. Por isso, o runner faz uma chamada-sonda mínima primeiro e interrompe antes dos lotes se a sonda falhar.

Não envia `thinking`, `chat_template_kwargs`, `response_format` nem parâmetros especiais de raciocínio. Na experiência anterior, o gateway rejeitou `thinking` com HTTP 400. O runner usa texto simples porque o prompt do experimento já define o formato de resposta.

## Executar no PowerShell

Use a branch dedicada e rode a partir da raiz do repositório:

```powershell
git fetch origin
git switch experiment/glm53-reference-review

$secure = Read-Host "Chave de API da Digiti" -AsSecureString
$env:MAAS_API_KEY = [System.Net.NetworkCredential]::new("", $secure).Password

node .\tools\glm53-review\run-review.mjs `
  --prompt .\tools\glm53-review\input\prompt-revisao.md `
  --arabic .\tools\glm53-review\input\lote-1-arabe.md `
  --hebrew .\tools\glm53-review\input\lote-2-hebraico.md

$env:MAAS_API_KEY = $null
```

Opcionalmente, defina `DIGITI_MAAS_URL`, `DIGITI_MAAS_MODEL` ou `DIGITI_MAX_TOKENS`. O padrão é o endpoint acima, `glm-5.3` e 24.000 tokens de saída. O script envia primeiro a sonda, depois o lote árabe e depois o hebraico, sem chamadas paralelas.

## Insumos (`input/`)

Os três arquivos estão versionados nesta branch, com os hashes em `input/SHA256SUMS`:

- `lote-1-arabe.md` e `lote-2-hebraico.md`: idênticos aos lotes entregues pelo Claude, com o versículo completo de cada caso. Trazem as atribuições exigidas do Tanzil e do OSHB.
- `prompt-revisao.md`: é o prompt entregue para uso em chat, com só duas mudanças para a API.
  - Saiu o cabeçalho com as instruções de "colar no chat".
  - A última frase passou de "Comece quando eu colar o primeiro lote." para "O lote a revisar vem na próxima mensagem."

  O conteúdo da revisão não mudou.

Para conferir no PowerShell: `Get-FileHash .\tools\glm53-review\input\*.md -Algorithm SHA256`.

## Diagnóstico antes de rodar os lotes

```powershell
node .\tools\glm53-review\run-review.mjs --diagnose `
  --prompt .\tools\glm53-review\input\prompt-revisao.md `
  --arabic .\tools\glm53-review\input\lote-1-arabe.md
```

O diagnóstico faz 5 chamadas de 1 caso (`ar-001`), uma de cada vez, e imprime uma tabela com resultado, se o streaming foi repassado, tempo até o primeiro byte, tempo total, modelo devolvido e tokens. Nenhuma resposta é gravada. As chamadas são:

1. `glm-5.3` com streaming e raciocínio padrão;
2. `glm-5.3` com streaming e `reasoning_effort: "low"`;
3. `glm-5.2` com streaming, o modelo que já funcionou neste gateway;
4. `deepseek-v4-flash` com streaming e raciocínio padrão;
5. `deepseek-v4-flash` com streaming e sem raciocínio (`chat_template_kwargs: {"thinking": false}`). Se o gateway recusar esse parâmetro, a tabela mostra o erro, que também é um resultado.

Fatos da documentação da Huawei MaaS que motivam o diagnóstico:

- no GLM-5.3, o raciocínio não pode ser desligado, e o `reasoning_effort` padrão é `max`;
- `reasoning_effort: "low"` dá um raciocínio mais curto;
- no GLM-5.2, o raciocínio é configurável;
- `max_tokens` não conta o raciocínio;
- no DeepSeek-V4-Flash (`deepseek-v4-flash`), o raciocínio é configurável e pode ser desligado com `chat_template_kwargs.thinking=false`.

Fontes: [API compatível com OpenAI](https://support.huaweicloud.com/intl/en-us/model-call-maas/model-call-021.html) e [lista de modelos](https://support.huaweicloud.com/intl/en-us/model-list-maas/model_list_0001.html).

O limite de tempo do gateway da Digiti não é público. Os erros 504 e 520 da primeira execução vieram do servidor por trás da Cloudflare, não do corte de 100 s da própria Cloudflare, que daria erro 524. Por isso o diagnóstico mede o tempo em vez de supô-lo. Para rodar os lotes com raciocínio curto, use `--reasoning-effort low`. Para usar outro modelo, `--model glm-5.2` ou `--model deepseek-v4-flash`; neste último, acrescente `--thinking off` para desligar o raciocínio.

## Pedaços, novas tentativas e retomada

A Digiti fica atrás da Cloudflare, que corta qualquer requisição sem resposta em cerca de 100 s. Isso dá HTTP 504 "Gateway time-out". Na primeira execução real (23/10/2026), o lote árabe inteiro passou desse limite; pedaços de 10 casos também passaram, por causa do raciocínio do GLM-5.3. Por isso o runner:

- **usa streaming por padrão.** Os tokens chegam aos poucos, então a conexão não fica ociosa e a Cloudflare não a corta. O texto final vem de `delta.content`; o raciocínio (`delta.reasoning_content`) é descartado e nunca é salvo. A chamada é abortada após 3 min sem receber dado nenhum ou após 30 min no total. Para voltar ao modo antigo, use `--no-stream`;

- **divide cada lote em pedaços** de 10 casos (`--chunk-size 10`, o padrão; `0` envia o lote inteiro). Cada pedaço leva o cabeçalho do lote, com as atribuições e as raízes cobertas, mais as seções `### id`, sem alterar nenhum caractere. O script confere que cabeçalho e seções reconstroem o lote original;
- **tenta de novo** em erros transitórios (429, 5xx, 520, 522, 524 e falha de conexão), até `--retries 2` vezes, com espera de 20 s e depois 40 s;
- **retoma de onde parou**: se você rodar de novo, cada pedaço já salvo, com o mesmo hash de insumo, completo e sem truncamento, é reaproveitado sem nova chamada;
- **consolida** o resultado em `01-arabe.md` e `02-hebraico.md`, e a auditoria de ids em `*.audit.json`, contra o lote inteiro. Os pedaços ficam em `*.pNN.md` e `*.pNN.meta.json`.

Se ainda der 504, use `--chunk-size 5`. Se aparecer `finish_reason=length` (resposta truncada), use `$env:DIGITI_MAX_TOKENS = "60000"`. Nos dois casos, basta rodar de novo: os pedaços prontos são reaproveitados.

## Saídas e controles

Os arquivos ficam em `tools/glm53-review/output/`, ignorados pelo Git:

- `00-probe.md` e metadados da sonda;
- `01-arabe.md` e `02-hebraico.md` com a resposta final;
- arquivos `.meta.json` com identificador da resposta, modelo retornado, `finish_reason`, uso de tokens e hashes dos insumos;
- arquivos `.audit.json` verificando quais IDs esperados aparecem na resposta.

O script **não grava** a chave nem o campo `reasoning_content). Se a API negar `glm-5.3`, não envia os lotes. Se o gateway reportar truncamento (`finish_reason=length`) ou faltarem IDs, a saída é sinalizada para inspeção. A presença de todos os IDs é apenas uma verificação mecânica; não prova a qualidade linguística da revisão.

## Limites do experimento

A resposta é uma **segunda revisão automática**, não uma revisão humana. O GLM pode errar ou concordar com uma classificação incorreta. Não atualize `review.reviewed_by` como se o modelo fosse pessoa; registre o modelo, versão/ID, prompt e hashes em metadados de auditoria. A decisão sobre substituir ou reduzir a revisão humana continua sendo de Guilherme e da Luna, conforme o plano do S2.

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

## Atenção a truncamento e tempo

O GLM-5.3 raciocina antes de responder. Se o gateway contar esse raciocínio dentro de `max_tokens`, 24.000 podem não bastar para os 80 casos árabes, e o runner acusa `finish_reason=length`. Nesse caso, rode de novo com `$env:DIGITI_MAX_TOKENS = "60000"`. O limite de 300 s por chamada também pode ser curto para o lote árabe. Se der timeout, avise antes de aumentar o limite no código.

## Saídas e controles

Os arquivos ficam em `tools/glm53-review/output/`, ignorados pelo Git:

- `00-probe.md` e metadados da sonda;
- `01-arabe.md` e `02-hebraico.md` com a resposta final;
- arquivos `.meta.json` com identificador da resposta, modelo retornado, `finish_reason`, uso de tokens e hashes dos insumos;
- arquivos `.audit.json` verificando quais IDs esperados aparecem na resposta.

O script **não grava** a chave nem o campo `reasoning_content). Se a API negar `glm-5.3`, não envia os lotes. Se o gateway reportar truncamento (`finish_reason=length`) ou faltarem IDs, a saída é sinalizada para inspeção. A presença de todos os IDs é apenas uma verificação mecânica; não prova a qualidade linguística da revisão.

## Limites do experimento

A resposta é uma **segunda revisão automática**, não uma revisão humana. O GLM pode errar ou concordar com uma classificação incorreta. Não atualize `review.reviewed_by` como se o modelo fosse pessoa; registre o modelo, versão/ID, prompt e hashes em metadados de auditoria. A decisão sobre substituir ou reduzir a revisão humana continua sendo de Guilherme e da Luna, conforme o plano do S2.

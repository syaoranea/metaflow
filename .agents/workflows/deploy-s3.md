---
description: Deploy do projeto Angular para a AWS S3
---
Para realizar o deploy na AWS S3 usando este workflow localmente via CLI:

1. Faça o build de produção da aplicação garantindo o ambiente limpo.
// turbo
npm run build

2. Envie os arquivos da pasta \`dist/meta-flow-ng/browser\` diretamente para as alterações do seu Bucket no S3.
// Recomendado verificar e substituir 'NOME_DO_SEU_BUCKET' na regra local, caso automatize totalmente.
aws s3 sync dist/meta-flow-ng/browser/ s3://NOME_DO_SEU_BUCKET --delete

3. (Opcional) Remova/invalide o cache no CloudFront, caso utilize.
aws cloudfront create-invalidation --distribution-id SEU_DISTRIBUTION_ID --paths "/*"

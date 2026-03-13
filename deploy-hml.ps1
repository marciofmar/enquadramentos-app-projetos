# ============================================================
# ROTINA DE USO - DEPLOY PARA HOMOLOGAÇÃO (HML)
#
# Passos antes de rodar:
#
# 1) Testar tudo localmente
# 2) Garantir que migrations foram geradas
#       supabase db diff -f nome_da_migration
# 3) Commitar alterações
#       git add .
#       git commit -m "mensagem"
# 4) Estar na branch teste-preview
#       git checkout teste-preview
# 5) Executar
#       .\deploy-hml.ps1
#
# O script irá:
#   • verificar problemas comuns
#   • enviar código para preview
#   • aplicar migrations no HML
# ============================================================

Write-Host ""
Write-Host "======== DEPLOY HML ========"

# ------------------------------------------------
# verificar branch
# ------------------------------------------------

$branch = git rev-parse --abbrev-ref HEAD

if ($branch -ne "teste-preview") {
    Write-Host "ERRO: você precisa estar na branch teste-preview"
    Write-Host "Branch atual: $branch"
    exit
}

Write-Host "Branch OK: $branch"

# ------------------------------------------------
# verificar alterações não commitadas
# ------------------------------------------------

$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host ""
    Write-Host "ERRO: existem arquivos não commitados"
    git status
    exit
}

Write-Host "Sem arquivos pendentes"

# ------------------------------------------------
# verificar se branch está atrás do remoto
# ------------------------------------------------

git fetch

$behind = git rev-list HEAD..origin/teste-preview --count

if ($behind -gt 0) {
    Write-Host ""
    Write-Host "ERRO: sua branch está atrás do remoto"
    Write-Host "Execute: git pull"
    exit
}

Write-Host "Branch sincronizada com remoto"

# ------------------------------------------------
# verificar migrations
# ------------------------------------------------

Write-Host ""
Write-Host "Estado das migrations:"
supabase migration list

# ------------------------------------------------
# build do projeto
# ------------------------------------------------

Write-Host ""
Write-Host "Testando build..."

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERRO: build falhou"
    exit
}

Write-Host "Build OK"

# ------------------------------------------------
# deploy preview
# ------------------------------------------------

Write-Host ""
Write-Host "Enviando código para preview..."

git push origin teste-preview

# ------------------------------------------------
# migrations HML
# ------------------------------------------------

Write-Host ""
Write-Host "Aplicando migrations no HML..."

supabase link --project-ref kfwpakagsngonlsaolsb
supabase db push

Write-Host ""
Write-Host "DEPLOY HML FINALIZADO"
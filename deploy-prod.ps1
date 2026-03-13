# ============================================================
# ROTINA DE USO - DEPLOY PRODUÇÃO
#
# Este script deve ser executado apenas após
# validação completa no ambiente HML.
#
# Passos:
#
# 1) Garantir que HML foi testado
# 2) Merge da preview
#
#       git checkout main
#       git pull
#       git merge teste-preview
#
# 3) Executar:
#
#       .\deploy-prod.ps1
#
# ============================================================

Write-Host ""
Write-Host "======== DEPLOY PRODUÇÃO ========"

# ------------------------------------------------
# verificar branch
# ------------------------------------------------

$branch = git rev-parse --abbrev-ref HEAD

if ($branch -ne "main") {
    Write-Host "ERRO: você precisa estar na branch main"
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
# verificar sync com remoto
# ------------------------------------------------

git fetch

$behind = git rev-list HEAD..origin/main --count

if ($behind -gt 0) {
    Write-Host ""
    Write-Host "ERRO: sua branch está atrás do remoto"
    Write-Host "Execute: git pull"
    exit
}

Write-Host "Branch sincronizada"

# ------------------------------------------------
# build
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
# deploy produção
# ------------------------------------------------

Write-Host ""
Write-Host "Enviando código para produção..."

git push origin main

# ------------------------------------------------
# migrations produção
# ------------------------------------------------

Write-Host ""
Write-Host "Aplicando migrations em PRODUÇÃO..."

supabase link --project-ref lqcmieoasiyhgffgbpem
supabase db push

Write-Host ""
Write-Host "DEPLOY PRODUÇÃO FINALIZADO"
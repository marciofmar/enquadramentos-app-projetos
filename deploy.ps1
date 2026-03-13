# ============================================================
# SISTEMA DE GERENCIAMENTO DE DESENVOLVIMENTO E DEPLOY
# ============================================================
#
# Este script centraliza as operações principais do projeto:
#
# 1 - Iniciar ambiente de desenvolvimento
# 2 - Deploy para HOMOLOGAÇÃO (Preview + Supabase HML)
# 3 - Deploy para PRODUÇÃO (Vercel + Supabase PROD)
# 4 - Verificar estado das migrations
#
# O objetivo é evitar erros comuns como:
#
# • desenvolver na branch errada
# • deploy com arquivos não commitados
# • deploy com build quebrado
# • publicar produção por acidente
#
# ============================================================
# FLUXO DE TRABALHO RECOMENDADO
# ============================================================
#
# 1️⃣ INICIAR O DIA DE DESENVOLVIMENTO
#
# Executar:
#
#    .\deploy.ps1
#
# Escolher opção:
#
#    1
#
# O script irá:
#
# • mudar para a branch teste-preview
# • criar a branch se ela não existir
# • atualizar o código com git pull
# • mostrar o status do projeto
#
#
# 2️⃣ DESENVOLVER FUNCIONALIDADES
#
# Trabalhar normalmente no projeto.
#
# Quando terminar uma alteração:
#
#    git add .
#    git commit -m "descrição da mudança"
#
#
# 3️⃣ GERAR MIGRATIONS (SE HOUVER ALTERAÇÃO NO BANCO)
#
#    supabase db diff -f nome_da_migration
#
#
# 4️⃣ TESTAR EM HOMOLOGAÇÃO
#
# Executar:
#
#    .\deploy.ps1
#
# Escolher:
#
#    2
#
# O script irá:
#
# • verificar arquivos não commitados
# • verificar build do projeto
# • enviar código para preview
# • aplicar migrations no Supabase HML
#
#
# 5️⃣ VALIDAR SISTEMA
#
# Abrir a URL de preview e testar:
#
# • login
# • funcionalidades alteradas
# • fluxos principais
#
#
# 6️⃣ PUBLICAR EM PRODUÇÃO
#
# Após validação completa:
#
#    git checkout main
#    git pull
#    git merge teste-preview
#
# Depois executar:
#
#    .\deploy.ps1
#
# Escolher:
#
#    3
#
# O script irá:
#
# • enviar código para produção
# • aplicar migrations no Supabase PROD
#
#
# ============================================================
# ESTRUTURA DE BRANCHES
# ============================================================
#
# main           → produção
# teste-preview  → homologação
#
# Nunca desenvolver diretamente na branch main.
#
# ============================================================



function CheckGitClean {

    $gitStatus = git status --porcelain

    if ($gitStatus) {

        Write-Host ""
        Write-Host "ERRO: existem arquivos não commitados."
        git status
        exit

    }

}



function CheckBuild {

    Write-Host ""
    Write-Host "Testando build..."

    npm run build

    if ($LASTEXITCODE -ne 0) {

        Write-Host ""
        Write-Host "ERRO: build falhou."
        exit

    }

}



function StartDev {

    Write-Host ""
    Write-Host "======== INICIAR DESENVOLVIMENTO ========"

    $branch = git rev-parse --abbrev-ref HEAD

    Write-Host ""
    Write-Host "Branch atual: $branch"

    if ($branch -ne "teste-preview") {

        Write-Host ""
        Write-Host "Mudando para branch teste-preview..."

        git checkout teste-preview

        if ($LASTEXITCODE -ne 0) {

            Write-Host ""
            Write-Host "Branch teste-preview não existe. Criando..."

            git checkout -b teste-preview
            git push -u origin teste-preview

        }

    }

    Write-Host ""
    Write-Host "Atualizando código..."

    git pull

    Write-Host ""
    Write-Host "Ambiente pronto para desenvolvimento."
    Write-Host ""

    git status

}



function DeployHML {

    $currentBranch = git rev-parse --abbrev-ref HEAD

    Write-Host ""
    Write-Host "======== DEPLOY HOMOLOGAÇÃO ========"

    if ($currentBranch -ne "teste-preview") {

        Write-Host ""
        Write-Host "ERRO: você precisa estar na branch teste-preview."
        exit

    }

    CheckGitClean
    CheckBuild

    Write-Host ""
    Write-Host "Enviando código para preview..."

    git push origin teste-preview

    Write-Host ""
    Write-Host "Aplicando migrations no HML..."

    supabase link --project-ref kfwpakagsngonlsaolsb
    supabase db push

    Write-Host ""
    Write-Host "Deploy HML finalizado."

}



function DeployProd {

    $currentBranch = git rev-parse --abbrev-ref HEAD

    Write-Host ""
    Write-Host "======== DEPLOY PRODUÇÃO ========"

    if ($currentBranch -ne "main") {

        Write-Host ""
        Write-Host "ERRO: você precisa estar na branch main."
        exit

    }

    Write-Host ""
    Write-Host "ATENÇÃO: você está prestes a publicar em PRODUÇÃO."
    Write-Host ""

    $confirm = Read-Host "Digite PROD para confirmar"

    if ($confirm -ne "PROD") {

        Write-Host ""
        Write-Host "Deploy cancelado."
        exit

    }

    CheckGitClean
    CheckBuild

    Write-Host ""
    Write-Host "Enviando código para produção..."

    git push origin main

    Write-Host ""
    Write-Host "Aplicando migrations em produção..."

    supabase link --project-ref lqcmieoasiyhgffgbpem
    supabase db push

    Write-Host ""
    Write-Host "Deploy produção finalizado."

}



function CheckMigrations {

    Write-Host ""
    Write-Host "Estado das migrations:"
    supabase migration list

}



Write-Host ""
Write-Host "================================="
Write-Host "        MENU DO PROJETO"
Write-Host "================================="

$currentBranch = git rev-parse --abbrev-ref HEAD

Write-Host ""
Write-Host "Branch atual: $currentBranch"
Write-Host ""

Write-Host "1 - Iniciar DESENVOLVIMENTO"
Write-Host "2 - Deploy HOMOLOGAÇÃO"
Write-Host "3 - Deploy PRODUÇÃO"
Write-Host "4 - Ver estado das migrations"
Write-Host ""

$choice = Read-Host "Escolha uma opção"


switch ($choice) {

    "1" { StartDev }
    "2" { DeployHML }
    "3" { DeployProd }
    "4" { CheckMigrations }

    default {

        Write-Host ""
        Write-Host "Opção inválida."

    }

}
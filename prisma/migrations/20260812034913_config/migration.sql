-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL DEFAULT '1',
    "nomeFantasia" TEXT NOT NULL DEFAULT 'Aura Aesthetics',
    "razaoSocial" TEXT NOT NULL DEFAULT '',
    "cnpj" TEXT NOT NULL DEFAULT '',
    "inscricaoMun" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT 'contato@auraaesthetics.com.br',
    "whatsapp" TEXT NOT NULL DEFAULT '(11) 99999-9999',
    "cep" TEXT NOT NULL DEFAULT '01415-000',
    "endereco" TEXT NOT NULL DEFAULT 'Rua Oscar Freire, 1000',
    "logoUrl" TEXT NOT NULL DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJgqUJmq2CmUG03OfG0psHxEYIuhitDO52_gUwk8F8RZg2NQnbEhYfRLGQ5TidI1PQdXk00Xw7I42dbGfhFFQEO4Lu_WoZOLrCp7W_EXOKVCGjHQURkXvvR3DBTBDmMNMWA8d6IrcaGNCrutj-Skz2IYO8lG4mHVB7QbJOSq9toEYP-ZoPJQP2SX4QDMGSF_Yjnau6N9tAR7Ri2JHMYyGKVZnxkW7YzHBC8m-zSDH28mVq8AKWTzzqFA',

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

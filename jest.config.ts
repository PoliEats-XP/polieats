import type { Config } from 'jest'

const config: Config = {
	// Define o ambiente de teste como jsdom para simular o DOM
	preset: 'ts-jest',
	testEnvironment: 'jsdom',

	// Arquivos de configuração adicionais, se houver
	setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],

	// Mapeamento de módulos (para imports como @/ ou arquivos estáticos)
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1', // Suporte para alias @/*
	},

	// Configuração do transformador para arquivos TS/TSX
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.jest.json',
				useESM: true,
			},
		],
	},

	// Ignora node_modules por padrão, exceto se precisar transformar algo específico
	transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],

	// Extensões de arquivo reconhecidas
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

	// Padrões de teste
	testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
}

export default config

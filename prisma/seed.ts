import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Seeding database...')

	// Sample menu items
	const menuItems = [
		{
			name: 'X-Burger Clássico',
			price: 15.9,
			quantity: 25,
		},
		{
			name: 'X-Bacon',
			price: 18.5,
			quantity: 20,
		},
		{
			name: 'X-Tudo',
			price: 22.9,
			quantity: 15,
		},
		{
			name: 'Hambúrguer Vegetariano',
			price: 16.9,
			quantity: 12,
		},
		{
			name: 'Batata Frita Pequena',
			price: 8.9,
			quantity: 30,
		},
		{
			name: 'Batata Frita Grande',
			price: 12.9,
			quantity: 25,
		},
		{
			name: 'Refrigerante Lata',
			price: 4.5,
			quantity: 50,
		},
		{
			name: 'Suco Natural de Laranja',
			price: 6.9,
			quantity: 20,
		},
		{
			name: 'Água Mineral',
			price: 2.5,
			quantity: 40,
		},
		{
			name: 'Milkshake de Chocolate',
			price: 9.9,
			quantity: 15,
		},
		{
			name: 'Pizza Margherita',
			price: 28.9,
			quantity: 8,
		},
		{
			name: 'Pizza Calabresa',
			price: 32.9,
			quantity: 6,
		},
		{
			name: 'Sanduíche Natural',
			price: 12.9,
			quantity: 18,
		},
		{
			name: 'Salada Caesar',
			price: 14.9,
			quantity: 10,
		},
		{
			name: 'Açaí 300ml',
			price: 11.9,
			quantity: 22,
		},
		{
			name: 'Café Expresso',
			price: 3.5,
			quantity: 0, // Out of stock item
		},
		{
			name: 'Cappuccino',
			price: 5.9,
			quantity: 3, // Low stock item
		},
		{
			name: 'Torta de Limão',
			price: 7.9,
			quantity: 12,
		},
		{
			name: 'Brownie com Sorvete',
			price: 9.9,
			quantity: 8,
		},
		{
			name: 'Wrap de Frango',
			price: 13.9,
			quantity: 16,
		},
	]

	// Create menu items
	for (const item of menuItems) {
		await prisma.item.upsert({
			where: { name: item.name },
			update: {
				price: item.price,
				quantity: item.quantity,
			},
			create: {
				name: item.name,
				price: item.price,
				quantity: item.quantity,
			},
		})
	}

	console.log(`✅ Created ${menuItems.length} menu items`)
	console.log('🎉 Seeding completed!')
}

main()
	.catch((e) => {
		console.error('❌ Seeding failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

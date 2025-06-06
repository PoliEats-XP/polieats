import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	const items = await prisma.item.findMany()

	return NextResponse.json({ items }, { status: 200 })
}

export async function POST(req: NextRequest) {
	const { name, price, initial_available_quantity } = await req.json()

	await prisma.item.create({
		data: {
			name,
			price: Number.parseFloat(price),
			quantity: Number.parseInt(initial_available_quantity),
		},
	})

	return NextResponse.json(
		{ message: 'Item created successfully' },
		{ status: 201 }
	)
}

export async function PUT(req: NextRequest) {
	try {
		const { id, name, price, initial_available_quantity } = await req.json()

		if (!id) {
			return NextResponse.json(
				{ message: 'Item ID is required' },
				{ status: 400 }
			)
		}

		const updatedItem = await prisma.item.update({
			where: {
				id,
			},
			data: {
				name,
				price: Number.parseFloat(price),
				quantity: Number.parseInt(initial_available_quantity),
			},
		})

		return NextResponse.json(
			{ message: 'Item updated successfully', item: updatedItem },
			{ status: 200 }
		)
	} catch (e) {
		console.log(e)

		return NextResponse.json(
			{ message: 'Error updating item', error: e },
			{ status: 500 }
		)
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { id } = await req.json()

		await prisma.item.delete({
			where: {
				id,
			},
		})

		return NextResponse.json(
			{ message: 'Item deleted successfully' },
			{ status: 200 }
		)
	} catch (e) {
		console.log(e)

		return NextResponse.json(
			{ message: 'Error deleting item', error: e },
			{ status: 500 }
		)
	}
}

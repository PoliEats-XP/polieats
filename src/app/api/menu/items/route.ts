import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	const items = await prisma.item.findMany()

	return NextResponse.json({ items }, { status: 200 })
}

export async function POST(req: NextRequest) {
	const { name, price, quantity } = await req.json()

	await prisma.item.create({
		data: {
			name,
			price,
			quantity,
		},
	})

	return NextResponse.json(
		{ message: 'Item created successfully' },
		{ status: 201 }
	)
}

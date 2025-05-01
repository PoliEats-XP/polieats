import { Item } from '@/components/item'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Dashboard() {
	return (
		<>
			<Navbar variant="admin" activeLink="menu" />

			<div className="max-w-7xl mx-auto p-6 mt-12">
				<div className="flex justify-between items-center mb-3">
					<SearchInput />
					<Button
						variant="outline"
						className="flex items-center text-normal py-1 cursor-pointer"
					>
						<Plus className="size-4 mr-1" /> Adicionar item ao menu
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<Item id="1" name="Item 1" available_quantity={10} price={100} />
					<Item id="2" name="Item 2" available_quantity={5} price={200} />
					<Item id="3" name="Item 3" available_quantity={20} price={50} />
					<Item id="1" name="Item 1" available_quantity={10} price={100} />
					<Item id="2" name="Item 2" available_quantity={5} price={200} />
					<Item id="3" name="Item 3" available_quantity={20} price={50} />
				</div>
			</div>
		</>
	)
}

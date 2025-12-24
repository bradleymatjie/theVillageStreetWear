export default function CatalogLoading() {
    return (
        <div className="space-y-8">
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {['All', 'T-Shirts', 'Hoodies', 'Long Sleeve'].map((label) => (
                    <div
                        key={label}
                        className="px-4 py-2 text-sm font-medium rounded-full bg-gray-800 animate-pulse"
                    >
                        {label}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-gray-800 rounded-lg overflow-hidden animate-pulse"
                    >
                        <div className="aspect-square bg-gray-700" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

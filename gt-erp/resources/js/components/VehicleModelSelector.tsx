import debounce from 'lodash.debounce';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
// Since Command is missing, I will build a simple input + dropdown list using Popover probably, or just a custom div structure.

// Re-writing content to NOT use Command component if it's missing.
// actually, I should just check if I can implement a simple one.

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import axios from 'axios';

export interface VehicleModel {
    id: number;
    name: string;
}

interface VehicleModelSelectorProps {
    value?: number[]; // Array of selected IDs
    onChange: (value: number[]) => void;
    error?: string;
    initialSelectedModels?: VehicleModel[];
}

export default function VehicleModelSelector({
    value = [],
    onChange,
    error,
    initialSelectedModels = [],
}: VehicleModelSelectorProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<VehicleModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedModels, setSelectedModels] = useState<VehicleModel[]>(initialSelectedModels);
    const [isOpen, setIsOpen] = useState(false);

    // Sync initialSelectedModels if it changes (e.g. async load)
    useEffect(() => {
        if (initialSelectedModels.length > 0 && selectedModels.length === 0) {
            setSelectedModels(initialSelectedModels);
        }
    }, [initialSelectedModels]);

    // Initial fetch for selected models if value is present (for Edit mode)
    // This is tricky because we only have IDs. We might need to fetch the names or prepopulate.
    // Ideally the parent fetches the full objects or we fetch them here.
    // For now, let's assume we might need to fetch details for selected IDs if not available? 
    // Or we handle it by passing full objects?
    // The current props signature says `value: number[]`.
    // Let's verify how edit passes data. It passes `product` with loaded relationships.
    // So for Edit, we might want to pass initialObjects.

    // I will update props to accept initialObjects for edit mode.

    const search = async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`/api/vehicle-models/search?query=${encodeURIComponent(q)}`);
            console.log(response)
            setResults(response.data);
        } catch (error) {
            console.error('Failed to search vehicle models', error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(debounce(search, 300), []);

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    const handleSelect = (model: VehicleModel) => {
        if (!value.includes(model.id)) {
            const newValue = [...value, model.id];
            onChange(newValue);
            setSelectedModels([...selectedModels, model]);
        }
        setQuery('');
        setIsOpen(false);
    };

    const handleRemove = (id: number) => {
        const newValue = value.filter((v) => v !== id);
        onChange(newValue);
        setSelectedModels(selectedModels.filter((m) => m.id !== id));
    };

    // We need a way to set selectedModels from IDs if they are not in the list.
    // But since the parent component in Edit mode will have the loaded relations, 
    // it's best to pass the selected objects as a prop too, or handle it differently.
    // Let's add `selectedObjects` prop.

    return (
        <div className="relative space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedModels.map((model) => (
                    <Badge key={model.id} variant="secondary" className="flex items-center gap-1">
                        {model.name}
                        <button
                            type="button"
                            onClick={() => handleRemove(model.id)}
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <Input
                    type="text"
                    placeholder="Search vehicle models..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    // onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay for click handling
                    className={error ? 'border-red-500' : ''}
                />

                {isOpen && (query.length > 0 || results.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md p-1">
                        {loading && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
                        {!loading && results.length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">No models found.</div>
                        )}
                        {!loading && results.map((model) => (
                            <div
                                key={model.id}
                                className={`
                                    cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none 
                                    hover:bg-accent hover:text-accent-foreground
                                    ${value.includes(model.id) ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => {
                                    if (!value.includes(model.id)) {
                                        handleSelect(model);
                                    }
                                }}
                            >
                                {model.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

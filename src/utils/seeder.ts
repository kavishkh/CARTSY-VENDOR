import { supabase } from '../supabase';

const defaultProducts = [
    {
        id: "oversized-hoodie",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
        name: "Oversized Hoodie",
        price: "₹10,999",
        category: "Tops",
        gender: "unisex",
        description: "A heavyweight hoodie crafted from premium brushed cotton. Designed for a comfortable, oversized fit that maintains its shape. Features dropped shoulders and a double-layered hood.",
        details: ["100% Organic Cotton", "450 GSM Heavyweight Fabric", "Reactive Dyed", "Oversized Fit"],
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "essential-tee",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        name: "Essential Tee",
        price: "₹4,499",
        category: "Basics",
        gender: "unisex",
        description: "The perfect everyday tee. Made from high-quality single jersey cotton with a soft, clean feel. A slightly relaxed fit that sits comfortably on the body.",
        details: ["100% Fine Jersey Cotton", "220 GSM Medium Weight", "Ribbed Collar", "Regular Fit"],
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "cargo-pants",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800",
        name: "Cargo Pants",
        price: "₹12,499",
        category: "Bottoms",
        gender: "men",
        description: "Technical cargo pants with a modern silhouette. Featuring multiple utility pockets and adjustable ankle toggles for a versatile look.",
        details: ["Cotton Polyamide Blend", "Water Repellent Finish", "Six Pocket Construction", "Relaxed Tapered Fit"],
        images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800"]
    }
];

export async function seedDatabase() {
    const { data: existing } = await supabase.from('products').select('id');
    const existingIds = new Set(existing?.map(p => p.id) || []);
    
    const itemsToSeed = defaultProducts.filter(p => !existingIds.has(p.id));
    
    if (itemsToSeed.length === 0) return { success: true, count: 0 };
    
    const { error } = await supabase.from('products').insert(itemsToSeed);
    
    if (error) throw error;
    return { success: true, count: itemsToSeed.length };
}

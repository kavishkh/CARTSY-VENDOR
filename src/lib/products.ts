import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
    id: string;
    image: string;
    name: string;
    price: string;
    category: string;
    gender?: 'men' | 'women' | 'unisex';
    description: string;
    details: string[];
    images: string[];
}

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            if (error.message !== "Missing Supabase Credentials") {
                console.error('Error fetching products from Supabase:', error);
            }
            return products;
        }

        // Merge DB products with local fallback, avoiding duplicates by ID
        // DB products take precedence
        const dbProductIds = new Set(data?.map(p => p.id) || []);
        const mergedProducts = [
            ...(data || []),
            ...products.filter(p => !dbProductIds.has(p.id))
        ];
        
        return mergedProducts as Product[];
    } catch (err) {
        console.error('Failed to fetch products:', err);
        return products;
    }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        
        if (error || !data) {
            return products.find(p => p.id === id) || null;
        }
        
        return data as Product;
    } catch (err) {
        return products.find(p => p.id === id) || null;
    }
};

export const products: Product[] = [
    {
        id: "oversized-hoodie",
        image: product1,
        name: "Oversized Hoodie",
        price: "₹10,999",
        category: "Tops",
        gender: "unisex",
        description: "A heavyweight hoodie crafted from premium brushed cotton. Designed for a comfortable, oversized fit that maintains its shape. Features dropped shoulders and a double-layered hood.",
        details: ["100% Organic Cotton", "450 GSM Heavyweight Fabric", "Reactive Dyed", "Oversized Fit"],
        images: [product1, product2, product3]
    },
    {
        id: "essential-tee",
        image: product2,
        name: "Essential Tee",
        price: "₹4,499",
        category: "Basics",
        gender: "unisex",
        description: "The perfect everyday tee. Made from high-quality single jersey cotton with a soft, clean feel. A slightly relaxed fit that sits comfortably on the body.",
        details: ["100% Fine Jersey Cotton", "220 GSM Medium Weight", "Ribbed Collar", "Regular Fit"],
        images: [product2, product3, product1]
    },
    {
        id: "cargo-pants",
        image: product3,
        name: "Cargo Pants",
        price: "₹12,499",
        category: "Bottoms",
        gender: "men",
        description: "Technical cargo pants with a modern silhouette. Featuring multiple utility pockets and adjustable ankle toggles for a versatile look.",
        details: ["Cotton Polyamide Blend", "Water Repellent Finish", "Six Pocket Construction", "Relaxed Tapered Fit"],
        images: [product3, product4, product5]
    },
    {
        id: "crossbody-bag",
        image: product4,
        name: "Crossbody Bag",
        price: "₹8,999",
        category: "Accessories",
        gender: "unisex",
        description: "A minimal and functional bag for your daily essentials. Crafted from durable nylon with an adjustable strap and secure zip compartments.",
        details: ["High-Density Nylon", "YKK Zippers", "Adjustable Webbing Strap", "Internal Organizers"],
        images: [product4, product5, product6]
    },
    {
        id: "ribbed-beanie",
        image: product5,
        name: "Ribbed Beanie",
        price: "₹2,999",
        category: "Accessories",
        gender: "unisex",
        description: "Classic ribbed beanie made from a soft wool blend. Provides warmth without being bulky. A winter essential that complements any outfit.",
        details: ["Merino Wool Blend", "Soft Ribbed Knit", "Folded Cuff", "One Size Fits All"],
        images: [product5, product6, product1]
    },
    {
        id: "crewneck-sweat",
        image: product6,
        name: "Crewneck Sweat",
        price: "₹9,999",
        category: "Tops",
        gender: "men",
        description: "Minimalist crewneck sweatshirt with a structured fit. Features subtle tonal branding and ribbed trimmings. A versatile piece for layering.",
        details: ["Loopback Cotton Jersey", "380 GSM Midweight Fabric", "Regular Fit", "Pre-Shrunk"],
        images: [product6, product1, product2]
    },
    {
        id: "silk-slip-dress",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
        name: "Silk Slip Dress",
        price: "₹18,999",
        category: "Dresses",
        gender: "women",
        description: "A luxurious silk slip dress with a fluid silhouette. Features delicate spaghetti straps and a soft V-neckline.",
        details: ["100% Mulberry Silk", "Bias Cut", "Adjustable Straps", "Midi Length"],
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "tailored-blazer",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        name: "Tailored Blazer",
        price: "₹28,999",
        category: "Outerwear",
        gender: "women",
        description: "A sharp, double-breasted blazer in a structured wool blend. Perfect for a polished look from day to night.",
        details: ["Wool Blend", "Peak Lapels", "Fully Lined", "Structured Shoulders"],
        images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "minimalist-sneaker",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
        name: "Minimalist Sneaker",
        price: "₹15,999",
        category: "Shoes",
        gender: "unisex",
        description: "Clean, low-top sneakers crafted from premium Italian leather. A timeless design for any modern wardrobe.",
        details: ["100% Calfskin Leather", "Rubber Margom Sole", "Handmade in Italy", "Leather Lining"],
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "chelsea-boots",
        image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800",
        name: "Chelsea Boots",
        price: "₹21,999",
        category: "Shoes",
        gender: "men",
        description: "Classic Chelsea boots with a slim silhouette. Features elasticated side panels and a pull tab for ease of wear.",
        details: ["Suede Upper", "Leather Outsole", "Cushioned Insole", "Expertly Crafted"],
        images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "high-heel-sandal",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
        name: "High-Heel Sandal",
        price: "₹18,499",
        category: "Shoes",
        gender: "women",
        description: "Elegant high-heel sandals with a minimalist strap design. Perfect for formal occasions or elevating a casual outfit.",
        details: ["Satin Finish", "Stiletto Heel", "Square Toe", "Buckle Fastening"],
        images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "linen-shirt",
        image: "https://images.unsplash.com/photo-1594932224010-74f43a18562c?auto=format&fit=crop&q=80&w=800",
        name: "Linen Shirt",
        price: "₹7,999",
        category: "Tops",
        gender: "men",
        description: "Breathable linen shirt for warm weather. Relaxed fit with a classic collar and button-down front.",
        details: ["100% Pure Linen", "Garment Washed", "Soft Feel", "Relaxed Fit"],
        images: ["https://images.unsplash.com/photo-1594932224010-74f43a18562c?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "leather-tote",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
        name: "Leather Tote",
        price: "₹24,999",
        category: "Accessories",
        gender: "women",
        description: "A spacious tote bag in premium grained leather. Features interior pockets for organization.",
        details: ["Full Grain Leather", "Hand-Painted Edges", "Gold-Tone Hardware", "Spacious Interior"],
        images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "wool-trousers",
        image: "https://images.unsplash.com/photo-1624371414361-e6e8ea01c1e6?auto=format&fit=crop&q=80&w=800",
        name: "Wool Trousers",
        price: "₹14,999",
        category: "Bottoms",
        gender: "men",
        description: "Elegant wool trousers with a relaxed tapered leg. Features side pockets and a clean waist finish.",
        details: ["Super 100s Wool", "Pleated Front", "Concealed Zip Fly", "Tapered Cut"],
        images: ["https://images.unsplash.com/photo-1624371414361-e6e8ea01c1e6?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "cashmere-sweater",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        name: "Cashmere Sweater",
        price: "₹16,499",
        category: "Tops",
        gender: "women",
        description: "An incredibly soft cashmere sweater with a relaxed fit and dropped shoulders.",
        details: ["100% Mongolian Cashmere", "Ribbed Trims", "Relaxed Fit", "Sustainably Sourced"],
        images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "pleated-skirt",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
        name: "Pleated Skirt",
        price: "₹11,999",
        category: "Bottoms",
        gender: "women",
        description: "A mid-length pleated skirt with a high waist and fluid movement.",
        details: ["Recycled Polyester", "Elasticated Waistband", "Knife Pleats", "Midi Length"],
        images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "oversized-sunglasses",
        image: "https://images.unsplash.com/photo-1513073024634-866c59b91173?auto=format&fit=crop&q=80&w=800",
        name: "Oversized Sunglasses",
        price: "₹9,499",
        category: "Accessories",
        gender: "women",
        description: "Statement oversized sunglasses with a thick acetate frame and tinted lenses.",
        details: ["Premium Acetate", "100% UV Protection", "Hand-Polished", "Branded Case Included"],
        images: ["https://images.unsplash.com/photo-1513073024634-866c59b91173?auto=format&fit=crop&q=80&w=800"]
    },
];

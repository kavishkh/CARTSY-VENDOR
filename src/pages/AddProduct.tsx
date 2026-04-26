import { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Package, Upload, ArrowLeft, Plus, X, Image as ImageIcon, Check } from 'lucide-react';

interface ProductFormData {
  id: string;
  name: string;
  price: string;
  category: string;
  gender: string;
  description: string;
  details: string[];
  image: string;
}

const categories = ["Tops", "Basics", "Bottoms", "Accessories", "Dresses", "Outerwear", "Shoes"];
const genders = ["men", "women", "unisex"];

export default function AddProduct({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [detailInput, setDetailInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    name: '',
    price: '',
    category: 'Tops',
    gender: 'unisex',
    description: '',
    details: [],
    image: '',
  });

  const handleAddDetail = () => {
    if (detailInput.trim()) {
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, detailInput.trim()]
      }));
      setDetailInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large. Max 2MB.');
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || (!imageFile && !formData.image)) {
      toast.error('Please fill in all required fields including an image');
      return;
    }

    setLoading(true);

    let formattedPrice = formData.price;
    if (!formattedPrice.startsWith('₹')) {
      formattedPrice = `₹${formattedPrice}`;
    }

    const nameSlug = formData.name.toLowerCase().trim().replace(/\s+/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const productId = formData.id || `${nameSlug}-${randomSuffix}`;
    let imageUrl = formData.image;

    // Upload image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${productId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Product_image')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Product_image')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const productToSave = {
      ...formData,
      id: productId,
      price: formattedPrice,
      image: imageUrl,
      images: [imageUrl],
      vendor_id: user?.id,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('products')
      .insert([productToSave]);

    if (error) {
      console.error('Insert error:', error);
      toast.error(`Failed to add product: ${error.message}`);
    } else {
      toast.success('Product listed successfully!');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      onBack();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in group/main">
      <header className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-border transition-colors outline-none"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight">New Curation</h1>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mt-1">List a piece in the architectural collective</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Col: Image & Listing Identity */}
        <div className="space-y-8">
          <div className="group relative aspect-square bg-card/10 border border-border flex flex-col items-center justify-center overflow-hidden">
            {(previewUrl || formData.image) ? (
              <>
                <img src={previewUrl || formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(p => ({ ...p, image: '' }));
                    setPreviewUrl('');
                    setImageFile(null);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-background/80 border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-8">
                <ImageIcon size={32} className="mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Image Preview</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="group relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
                  Reference ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(p => ({ ...p, id: e.target.value }))}
                  className="w-full bg-transparent border-b border-border py-2 px-0 outline-none focus:border-accent transition-all font-mono text-xs placeholder:text-muted-foreground/20"
                  placeholder="e.g. premium-wool-scuplt"
                />
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
                <Check size={12} /> Live Synchronization Active
              </div>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 border border-border p-10 bg-card/5">
          <div className="group relative md:col-span-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors font-bold">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-display text-2xl uppercase placeholder:text-muted-foreground/10"
              placeholder="THE ARCHITECTURAL SWEATER"
            />
          </div>

          <div className="group relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
              Valuation (INR) *
            </label>
            <input
              type="text"
              required
              value={formData.price}
              onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
              className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-sm placeholder:text-muted-foreground/20"
              placeholder="12,999"
            />
          </div>

          <div className="group relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
              Category / Collective
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-transparent border-b border-border py-4 px-0 outline-none focus:border-accent transition-all font-mono text-[11px] uppercase tracking-widest appearance-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
            </select>
          </div>

          <div className="group relative md:col-span-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4 group-focus-within:text-accent transition-colors font-bold">
              Visual Narrative * (Upload Image)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="flex items-center justify-center gap-4 border-2 border-dashed border-border p-12 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all group/upload"
              >
                <div className="text-center">
                  <Upload size={24} className="mx-auto mb-4 text-muted-foreground group-hover/upload:text-accent transition-colors" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em]">
                    {imageFile ? imageFile.name : 'Select Piece Photography'}
                  </p>
                  <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-2 px-6">
                    Support for JPG, PNG, WEBP. Max 2MB.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="group relative md:col-span-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
              Manifesto / Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-xs leading-relaxed placeholder:text-muted-foreground/20 resize-none"
              placeholder="Articulate the vision and materials of this curated piece..."
            />
          </div>

          <div className="group relative md:col-span-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3 group-focus-within:text-accent transition-colors font-bold">
              Piece Specifications
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={detailInput}
                onChange={(e) => setDetailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDetail())}
                className="flex-1 bg-transparent border-b border-border py-2 px-0 outline-none focus:border-accent transition-all font-mono text-xs placeholder:text-muted-foreground/20"
                placeholder="ADD SPEC (E.G. 100% MERINO WOOL)"
              />
              <button 
                type="button" 
                onClick={handleAddDetail}
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-accent hover:text-background transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.details.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5 bg-border/30 border border-border/50 text-[9px] font-mono uppercase tracking-widest">
                  {d}
                  <button type="button" onClick={() => removeDetail(i)} className="hover:text-accent transition-colors"><X size={10} /></button>
                </div>
              ))}
              {formData.details.length === 0 && <span className="text-[9px] font-mono text-muted-foreground italic tracking-widest">NO SPECS LISTED</span>}
            </div>
          </div>

          <div className="md:col-span-2 pt-10 flex gap-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.3em] font-bold py-6 hover:bg-accent hover:text-background transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Publish to Collective'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-10 border border-border font-mono text-[11px] uppercase tracking-widest hover:bg-border transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

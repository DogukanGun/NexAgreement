'use client';

import { useState } from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { FileUploader } from './components/FileUploader';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Listing created successfully!');
  };
  
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'rental', label: 'Rental' },
    { value: 'employment', label: 'Employment' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'real-estate', label: 'Real Estate' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Create New Listing" 
        description="List your legal agreement on the marketplace"
      />

      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Agreement Title"
            id="title"
            name="title"
            placeholder="e.g. Premium Commercial Agreement"
            required
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              id="category"
              name="category"
              required
              options={categoryOptions}
              value={formData.category}
              onChange={handleChange}
            />
            
            <Input
              label="Price (ETH)"
              id="price"
              name="price"
              placeholder="e.g. 0.5"
              required
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="Description"
            id="description"
            name="description"
            rows={4}
            placeholder="Provide a detailed description of your agreement..."
            required
            value={formData.description}
            onChange={handleChange}
          />

          <FileUploader 
            onFileUploaded={(file) => console.log('File uploaded:', file)}
          />

          <div className="flex gap-4 justify-end">
            <Button 
              href="/dashboard/marketplace" 
              variant="secondary"
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
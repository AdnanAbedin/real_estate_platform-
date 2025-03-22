export interface Property {
    id?: string;
    title: string;
    price: number;
    location: string;
    description: string;
    companyId: string;
    tier: "standard" | "featured" | "premium";
    status: "active" | "inactive" | "sold";
    imageUrl?: string;
  }
  
  export interface Company {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    contactEmail: string;
    whatsappNumber?: string;
  }